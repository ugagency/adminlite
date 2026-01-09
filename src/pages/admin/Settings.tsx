import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-display font-medium tracking-tight">Configurações</h2>
                <p className="text-muted-foreground mt-1">Personalize sua loja</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-white border border-border p-1 rounded-lg mb-8">
                    <TabsTrigger value="general" className="data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-md transition-all">Geral</TabsTrigger>
                    <TabsTrigger value="payment" className="data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-md transition-all">Pagamento</TabsTrigger>
                    <TabsTrigger value="shipping" className="data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-md transition-all">Envio</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="rounded-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Informações da Loja</CardTitle>
                            <CardDescription>
                                Atualize o nome e endereço da sua loja.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="store-name">Nome da Loja</Label>
                                <Input id="store-name" defaultValue="Lite Fitness Beach" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contact-email">Email de Contato</Label>
                                <Input id="contact-email" defaultValue="contato@litefitnessbeach.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Moeda</Label>
                                <Input id="currency" defaultValue="BRL (R$)" disabled />
                            </div>
                            <div className="pt-4">
                                <Button className="btn-primary">Salvar Alterações</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment">
                    <Card className="rounded-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Provedores de Pagamento</CardTitle>
                            <CardDescription>
                                Configure as opções de pagamento para seus clientes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Configurações de Stripe e Pix aparecerão aqui.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shipping">
                    <Card className="rounded-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Métodos de Envio</CardTitle>
                            <CardDescription>
                                Configure as taxas e zonas de envio.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Configurações de Correios e Transportadoras aparecerão aqui.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
