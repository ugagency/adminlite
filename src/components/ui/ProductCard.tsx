import { Link } from 'react-router-dom';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Link to={`/produto/${product.id}`} className="product-card group block">
      <div className="product-card-image relative aspect-[3/4] bg-secondary mb-4 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-foreground text-background px-3 py-1 text-xs tracking-wide uppercase">
              Novo
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-primary text-primary-foreground px-3 py-1 text-xs tracking-wide uppercase">
              Mais Vendido
            </span>
          )}
        </div>

        {/* Quick View */}
        <div className="absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="text-sm tracking-wide uppercase">Ver produto</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-sm">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
