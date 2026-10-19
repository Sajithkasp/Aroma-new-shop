import type { Metadata } from 'next'
import { AROMA_FRAGRANCES } from '@/lib/aromaData'
import ProductDetailClient from './ProductDetailClient'

// Statically generate parameters for all known fragrances for static export & cloud deployments
export function generateStaticParams() {
  const slugs = AROMA_FRAGRANCES.map((fragrance) => ({
    slug: fragrance.slug,
  }))
  const ids = AROMA_FRAGRANCES.map((fragrance) => ({
    slug: fragrance.id,
  }))
  return [...slugs, ...ids]
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const fragrance =
    AROMA_FRAGRANCES.find((f) => f.slug === slug || f.id === slug) || AROMA_FRAGRANCES[0]

  return {
    title: `${fragrance.name} | Aroma Fine Perfumery Ceylon`,
    description: fragrance.description,
    openGraph: {
      title: `${fragrance.name} - Extrait de Parfum`,
      description: fragrance.description,
      images: [
        {
          url: fragrance.image_url,
          width: 800,
          height: 1000,
          alt: fragrance.name,
        },
      ],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  return <ProductDetailClient slug={resolvedParams.slug} />
}
