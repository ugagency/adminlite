import { Product } from './types';

import productLegging1 from '@/assets/product-legging-1.jpg';
import productTop1 from '@/assets/product-top-1.jpg';
import productBikini1 from '@/assets/product-bikini-1.jpg';
import productShorts1 from '@/assets/product-shorts-1.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: 'Legging Sculpt Pro',
    price: 289,
    image: productLegging1,
    category: 'fitness',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Nude', 'Verde Oliva'],
    description: 'Legging de alta compressão, zero transparência e toque frio. Ideal para treinos intensos e uso diário.',
    features: ['Zero transparência', 'Alta compressão', 'Poliamida premium', 'Costura reforçada', 'Conforto térmico'],
    isNew: true,
  },
  {
    id: '2',
    name: 'Top Essential',
    price: 189,
    image: productTop1,
    category: 'fitness',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Nude', 'Preto', 'Branco'],
    description: 'Top esportivo com suporte médio, perfeito para yoga, pilates e treinos de baixo impacto.',
    features: ['Suporte médio', 'Tecido respirável', 'Alças ajustáveis', 'Sem costura lateral'],
    isBestSeller: true,
  },
  {
    id: '3',
    name: 'Biquíni Minimal',
    price: 349,
    image: productBikini1,
    category: 'beachwear',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Nude', 'Terracota'],
    description: 'Biquíni sofisticado com design minimalista. Tecido de alta qualidade com proteção UV.',
    features: ['Proteção UV 50+', 'Secagem rápida', 'Forro duplo', 'Design atemporal'],
    isNew: true,
  },
  {
    id: '4',
    name: 'Short Runner',
    price: 199,
    image: productShorts1,
    category: 'fitness',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Verde Oliva', 'Preto', 'Nude'],
    description: 'Short de corrida com cintura alta e bolso lateral discreto. Perfeito para beach tennis e corridas.',
    features: ['Cintura alta', 'Bolso lateral', 'Tecido leve', 'Anti-odor'],
    isBestSeller: true,
  },
  {
    id: '5',
    name: 'Legging Flow',
    price: 269,
    image: productLegging1,
    category: 'fitness',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Nude', 'Preto', 'Terracota'],
    description: 'Legging de cintura alta com tecido ultra leve e flexível. Perfeita para yoga e pilates.',
    features: ['Cintura alta', 'Tecido ultra leve', 'Máxima flexibilidade', 'Toque macio'],
    isNew: false,
  },
  {
    id: '6',
    name: 'Top Cross',
    price: 209,
    image: productTop1,
    category: 'fitness',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Branco', 'Verde Oliva'],
    description: 'Top com design cruzado nas costas. Suporte alto para treinos intensos.',
    features: ['Suporte alto', 'Design diferenciado', 'Tecido compressivo', 'Bojo removível'],
    isNew: true,
  },
  {
    id: '7',
    name: 'Saída de Praia Leve',
    price: 279,
    image: productBikini1,
    category: 'beachwear',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Branco', 'Nude', 'Preto'],
    description: 'Saída de praia em tecido leve e fluido. Elegância para o pós-praia.',
    features: ['Tecido leve', 'Secagem rápida', 'Proteção UV', 'Versátil'],
    isBestSeller: true,
  },
  {
    id: '8',
    name: 'Conjunto Beach Tennis',
    price: 389,
    image: productShorts1,
    category: 'fitness',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Nude', 'Verde Oliva'],
    description: 'Conjunto exclusivo para beach tennis. Short e top com tecnologia anti-suor.',
    features: ['Anti-suor', 'Proteção UV', 'Bolso para bola', 'Design exclusivo'],
    isNew: true,
  },
  {
    id: '9',
    name: 'Maiô Elegance',
    price: 329,
    image: productBikini1,
    category: 'beachwear',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Nude', 'Terracota'],
    description: 'Maiô de uma peça com recortes estratégicos. Sofisticação para a praia ou piscina.',
    features: ['Recortes elegantes', 'Forro duplo', 'Proteção UV 50+', 'Modelagem perfeita'],
    isBestSeller: false,
  },
  {
    id: '10',
    name: 'Bermuda Comfort',
    price: 229,
    image: productShorts1,
    category: 'fitness',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Cinza', 'Verde Oliva'],
    description: 'Bermuda com comprimento médio e cós alto. Ideal para academia e dia a dia.',
    features: ['Cós alto', 'Bolso interno', 'Tecido leve', 'Anti-transparência'],
    isNew: false,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: 'fitness' | 'beachwear'): Product[] => {
  return products.filter(p => p.category === category);
};
