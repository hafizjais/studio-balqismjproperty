import {defineArrayMember, defineField, defineType} from 'sanity'

// Mirrors the website's RentalListing type (BalqisProperty/src/lib/types.ts).
// Real Airtable data has free-text bedrooms values like "2+1" — kept as a
// string here so editors can type that exactly; the website's mapping layer
// parses it to a number the same way the existing Airtable path does
// (non-numeric values become null, same behavior as today).

export const rental = defineType({
  name: 'rental',
  title: 'Rental',
  type: 'document',
  fields: [
    defineField({
      name: 'houseId',
      title: 'House ID',
      type: 'string',
      description: 'The old house ID, e.g. "House - 013". Must be unique.',
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          if (!value) return true
          const client = context.getClient({apiVersion: '2025-01-01'})
          const id = context.document?._id.replace(/^drafts\./, '')
          const taken = await client.fetch<boolean>(
            `count(*[_type == "rental" && houseId == $code && !(_id in [$id, $draftId])]) > 0`,
            {code: value, id, draftId: `drafts.${id}`},
          )
          return taken ? 'Another rental already uses this house ID' : true
        }),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: {
        source: 'houseId',
        slugify: (input: string) =>
          input
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'type',
      title: 'Property type',
      type: 'string',
      description:
        'Free text. Common values: Apartment, Flat, Condominium, Double Storey, Single Storey, Townhouse',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['available', 'not available', 'rented', 'reserved'],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'available',
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'string',
      description: 'Usually a plain number, but supports layouts like "2+1".',
    }),
    defineField({name: 'bathrooms', title: 'Bathrooms', type: 'number', validation: (r) => r.min(0)}),
    defineField({
      name: 'price',
      title: 'Monthly rent (RM)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      description: 'The first photo is the cover photo everywhere on the site. Drag to reorder.',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
    }),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 8}),
    defineField({
      name: 'areas',
      title: 'Areas',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({name: 'city', title: 'City', type: 'string', initialValue: 'Johor Bahru'}),
    defineField({name: 'address', title: 'Address', type: 'string'}),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'postedDate',
      title: 'Posted date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: 'Oldest first (default site order)',
      name: 'postedDateAsc',
      by: [
        {field: 'postedDate', direction: 'asc'},
        {field: '_createdAt', direction: 'asc'},
      ],
    },
    {
      title: 'Newest first',
      name: 'postedDateDesc',
      by: [
        {field: 'postedDate', direction: 'desc'},
        {field: '_createdAt', direction: 'desc'},
      ],
    },
  ],
  preview: {
    select: {title: 'title', houseId: 'houseId', price: 'price', media: 'images.0'},
    prepare({title, houseId, price, media}) {
      const priceText = price ? `RM ${Number(price).toLocaleString('en-MY')}/mo` : 'Price on Request'
      return {
        title: title || houseId || 'Untitled rental',
        subtitle: [houseId, priceText].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
