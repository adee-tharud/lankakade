import { Link } from 'react-router-dom'
import {
  Wheat,
  Coffee,
  Cookie,
  Droplets,
  Leaf,
  ArrowUpRight,
} from 'lucide-react'
import type { Category } from '../services/catalog-api'

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <div className="gap-4 flex flex-wrap mobile:gap-2.5">
      {categories.map((category) => {
        const slug = category.slug.toLowerCase()
        const Icon = /rice|grain|orez/.test(slug)
          ? Wheat
          : /tea|coffee|ceai/.test(slug)
            ? Coffee
            : /snack|sweet/.test(slug)
              ? Cookie
              : /oil|coconut/.test(slug)
                ? Droplets
                : Leaf
        return (
          <Link
            key={category.id}
            to={'/shop?category=' + encodeURIComponent(category.slug)}
            className="p-5.5 gap-3.25 flex-1 min-w-42.5 max-w-75 flex items-center border border-border bg-surface rounded-xl [&_>_svg]:ml-auto mobile:p-3.75 mobile:min-w-36.25"
          >
            <span className="grid place-items-center bg-brand-soft rounded-full w-13.75 h-13.75 shrink-0 mobile:w-8.75 mobile:h-8.75">
              <Icon size={28} aria-hidden="true" />
            </span>
            <strong className="text-[0.8rem] mobile:text-[0.7rem]">
              {category.name}
            </strong>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        )
      })}
    </div>
  )
}
