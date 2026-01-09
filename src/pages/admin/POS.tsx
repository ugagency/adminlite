import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, Loader2, Package, UserPlus, Check, ChevronsUpDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CartItem {
    product_id: string;
    product_name: string;
    product_image: string | null;
    quantity: number;
    unit_price: number;
    size: string | null;
    color: string | null;
    stock_available: number;
}

export default function POS() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectionOptions, setSelectionOptions] = useState({ size: "", color: "" });
    const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "debit_card" | "pix">("credit_card");
    const [customerName, setCustomerName] = useState("");
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);

    // Customer Selection State
    const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false);
    const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({ full_name: "", email: "", whatsapp: "" });

    // Fetch Customers
    const { data: customers } = useQuery({
        queryKey: ["customers-pos"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("customers")
                .select("*")
                .order("full_name");
            if (error) throw error;
            return data;
        }
    });

    const createCustomerMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await (supabase as any)
                .from("customers")
                .insert([newCustomerForm])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            toast.success("Cliente cadastrado!");
            setCustomerName(data.full_name);
            setIsNewCustomerDialogOpen(false);
            setNewCustomerForm({ full_name: "", email: "", whatsapp: "" });
            queryClient.invalidateQueries({ queryKey: ["customers-pos"] });
        },
        onError: (err: any) => toast.error("Erro ao cadastrar: " + err.message)
    });

    // Fetch Products
    const { data: products, isLoading } = useQuery({
        queryKey: ["products-pos"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("products")
                .select("*")
                .gt("stock", 0) // Only show products with stock
                .order("name");
            if (error) throw error;
            return data;
        },
    });

    const filteredProducts = products?.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleProductClick = (product: any) => {
        // Check if product has options
        const hasSizes = product.sizes && product.sizes.length > 0;
        const hasColors = product.colors && product.colors.length > 0;

        if (hasSizes || hasColors) {
            setSelectedProduct(product);
            setSelectionOptions({
                size: hasSizes ? product.sizes[0] : null,
                color: hasColors ? product.colors[0] : null
            });
            setIsSelectionOpen(true);
        } else {
            addToCart(product, null, null);
        }
    };

    const confirmSelection = () => {
        if (selectedProduct) {
            addToCart(selectedProduct, selectionOptions.size, selectionOptions.color);
            setIsSelectionOpen(false);
            setSelectedProduct(null);
        }
    };

    const addToCart = (product: any, size: string | null, color: string | null) => {
        setCart(prev => {
            const existing = prev.find(item =>
                item.product_id === product.id &&
                item.size === size &&
                item.color === color
            );

            if (existing) {
                if (existing.quantity >= existing.stock_available) {
                    toast.error("Estoque máximo atingido para este item");
                    return prev;
                }
                return prev.map(item =>
                    (item.product_id === product.id && item.size === size && item.color === color)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, {
                product_id: product.id,
                product_name: product.name,
                product_image: product.images?.[0] || null,
                quantity: 1,
                unit_price: product.price,
                size,
                color,
                stock_available: product.stock
            }];
        });
        toast.success("Produto adicionado!");
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart(prev => prev.map((item, i) => {
            if (i === index) {
                const newQty = item.quantity + delta;
                if (newQty > item.stock_available) return item;
                if (newQty < 1) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);

    const checkoutMutation = useMutation({
        mutationFn: async () => {
            if (cart.length === 0) throw new Error("Carrinho vazio");

            // 0. Get current user
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Create Order
            const { data: order, error: orderError } = await (supabase as any)
                .from("orders")
                .insert({
                    customer_name: customerName || "Cliente Loja Física",
                    user_id: user?.id, // Bind order to the admin/user creating it
                    total: cartTotal,
                    subtotal: cartTotal,
                    status: "delivered", // Immediate delivery in physical store
                    payment_method: paymentMethod,
                    notes: "Venda Loja Física", // Identifies origin
                    created_at: new Date().toISOString() // Explicit timestamp
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            // 2. Create Order Items individually to respect RLS or trigger constraints on a per-row basis
            for (const item of cart) {
                const { error: itemError } = await (supabase as any)
                    .from("order_items")
                    .insert({
                        order_id: order.id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        unit_price: item.unit_price,
                        total_price: item.unit_price * item.quantity,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                        product_image: item.product_image
                    });

                if (itemError) {
                    console.error("Error inserting item:", itemError);
                    // attempt to cleanup order? Or just throw to stop stock deduction?
                    throw itemError;
                }
            }



            // 3. Update Stock
            for (const item of cart) {
                const { error: stockError } = await (supabase as any)
                    .rpc('decrement_stock', { p_id: item.product_id, idx: item.quantity });

                // Fallback if RPC doesn't exist (it usually doesn't by default), manual update
                if (stockError) {
                    // Manual fetch and update as fallback
                    const { data: currentProd } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
                    if (currentProd) {
                        await supabase.from('products').update({ stock: currentProd.stock - item.quantity }).eq('id', item.product_id);
                    }
                }
            }
        },
        onSuccess: () => {
            toast.success("Venda realizada com sucesso!");
            setCart([]);
            setCustomerName("");
            queryClient.invalidateQueries({ queryKey: ["products-pos"] });
            queryClient.invalidateQueries({ queryKey: ["products-admin"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error: any) => {
            console.error(error);
            toast.error("Erro ao finalizar venda: " + error.message);
        }
    });

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-6">
            {/* Left Panel: Product Selection */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-display font-medium tracking-tight">PDV / Loja Física</h2>
                    <p className="text-muted-foreground">Selecione os produtos para iniciar a venda.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar produto por nome ou código..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex-1 overflow-hidden bg-white rounded-xl border border-border shadow-sm">
                    <ScrollArea className="h-full">
                        <div className="p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {isLoading ? (
                                <div className="col-span-full py-12 text-center text-muted-foreground">Carregando estoque...</div>
                            ) : filteredProducts?.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-muted-foreground">Nenhum produto encontrado.</div>
                            ) : (
                                filteredProducts?.map((product: any) => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleProductClick(product)}
                                        className="group cursor-pointer border rounded-lg p-3 hover:border-primary hover:shadow-md transition-all bg-card"
                                    >
                                        <div className="aspect-square bg-secondary rounded-md mb-3 overflow-hidden flex items-center justify-center">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <Package className="w-8 h-8 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <h3 className="font-medium text-sm line-clamp-2 leading-tight min-h-[2.5em]" title={product.name}>{product.name}</h3>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="font-bold text-primary">
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] h-5">{product.stock} un</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Right Panel: Cart & Checkout */}
            <div className="w-full md:w-[400px] flex flex-col gap-4">
                <Card className="flex-1 flex flex-col border-border shadow-lg overflow-hidden h-full">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" /> Carrinho
                            </CardTitle>
                            <Badge variant="outline">{cart.length} itens</Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-auto p-0">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-2">
                                <ShoppingCart className="w-12 h-12 opacity-20" />
                                <p>O carrinho está vazio</p>
                                <p className="text-xs">Selecione produtos ao lado para adicionar</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {cart.map((item, index) => (
                                    <div key={index} className="p-4 flex gap-3">
                                        <div className="h-16 w-16 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                                            {item.product_image ? (
                                                <img src={item.product_image} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-full h-full p-4 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-medium text-sm truncate">{item.product_name}</h4>
                                                <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                                                    {item.size && <span>Tam: {item.size}</span>}
                                                    {item.color && <span>Cor: {item.color}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="font-semibold text-sm">
                                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.unit_price * item.quantity)}
                                                </div>
                                                <div className="flex items-center gap-2 bg-secondary rounded-md p-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-sm hover:bg-white"
                                                        onClick={() => updateQuantity(index, -1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="text-xs w-4 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-sm hover:bg-white"
                                                        onClick={() => updateQuantity(index, 1)}
                                                        disabled={item.quantity >= item.stock_available}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                                            onClick={() => removeFromCart(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex-col gap-4 border-t bg-secondary/5 p-4">
                        <div className="space-y-4 w-full">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Cliente (Opcional)</label>
                                <div className="flex gap-2">
                                    <Popover open={openCustomerCombobox} onOpenChange={setOpenCustomerCombobox}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCustomerCombobox}
                                                className="flex-1 justify-between bg-white font-normal"
                                            >
                                                {customerName || "Selecionar cliente..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar cliente..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {customers?.map((customer: any) => (
                                                            <CommandItem
                                                                key={customer.id}
                                                                value={customer.full_name}
                                                                onSelect={(currentValue) => {
                                                                    setCustomerName(currentValue === customerName ? "" : currentValue);
                                                                    setOpenCustomerCombobox(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        customerName === customer.full_name ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {customer.full_name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="outline" className="bg-white" title="Novo Cliente">
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Novo Cliente</DialogTitle>
                                                <DialogDescription>Cadastre um novo cliente rapidamente.</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-2">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Nome Completo</label>
                                                    <Input
                                                        value={newCustomerForm.full_name}
                                                        onChange={(e) => setNewCustomerForm(prev => ({ ...prev, full_name: e.target.value }))}
                                                        placeholder="Ex: Maria Silva"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">E-mail (Opcional)</label>
                                                    <Input
                                                        value={newCustomerForm.email}
                                                        onChange={(e) => setNewCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                                                        placeholder="email@exemplo.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">WhatsApp (Opcional)</label>
                                                    <Input
                                                        value={newCustomerForm.whatsapp}
                                                        onChange={(e) => setNewCustomerForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                                                        placeholder="Apenas números"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsNewCustomerDialogOpen(false)}>Cancelar</Button>
                                                <Button onClick={() => createCustomerMutation.mutate()} disabled={createCustomerMutation.isPending || !newCustomerForm.full_name}>
                                                    {createCustomerMutation.isPending ? "Salvando..." : "Salvar"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Forma de Pagamento</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant={paymentMethod === "credit_card" ? "default" : "outline"}
                                        size="sm"
                                        className="text-xs flex flex-col gap-1 h-14"
                                        onClick={() => setPaymentMethod("credit_card")}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Crédito
                                    </Button>
                                    <Button
                                        variant={paymentMethod === "debit_card" ? "default" : "outline"}
                                        size="sm"
                                        className="text-xs flex flex-col gap-1 h-14"
                                        onClick={() => setPaymentMethod("debit_card")}
                                    >
                                        <Banknote className="w-4 h-4" />
                                        Débito
                                    </Button>
                                    <Button
                                        variant={paymentMethod === "pix" ? "default" : "outline"}
                                        size="sm"
                                        className="text-xs flex flex-col gap-1 h-14"
                                        onClick={() => setPaymentMethod("pix")}
                                    >
                                        <QrCode className="w-4 h-4" />
                                        PIX / Din
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-4 pt-2">
                            <div className="flex items-center justify-between text-lg mt-2">
                                <span className="font-semibold">Total</span>
                                <span className="font-bold text-2xl text-primary">
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cartTotal)}
                                </span>
                            </div>

                            <Button
                                className="w-full btn-primary h-12 text-base"
                                onClick={() => checkoutMutation.mutate()}
                                disabled={cart.length === 0 || checkoutMutation.isPending}
                            >
                                {checkoutMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...
                                    </>
                                ) : (
                                    "Finalizar Venda"
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Option Selection Dialog */}
            <Dialog open={isSelectionOpen} onOpenChange={setIsSelectionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Selecione as opções</DialogTitle>
                        <DialogDescription>{selectedProduct?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {selectedProduct?.sizes?.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tamanho</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.sizes.map((s: string) => (
                                        <Button
                                            key={s}
                                            variant={selectionOptions.size === s ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectionOptions(prev => ({ ...prev, size: s }))}
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedProduct?.colors?.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cor</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.colors.map((c: string) => (
                                        <Button
                                            key={c}
                                            variant={selectionOptions.color === c ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectionOptions(prev => ({ ...prev, color: c }))}
                                        >
                                            {c}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSelectionOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmSelection}>Adicionar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
