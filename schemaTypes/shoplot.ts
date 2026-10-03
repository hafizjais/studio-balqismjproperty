import {defineArrayMember, defineField, defineType} from 'sanity'

// Field set mirrors the Listing type the website renders for shop lots
// (BalqisProperty/src/lib/types.ts) so the data layer is a straight mapping.

const SUB_TYPE_SUGGESTIONS = [
  'Single Storey',
  'Double Storey Terrace',
  'Semi-D',
  'Bungalow',
  'Apartment',
  'Service Apartment',
  'Condo',
  'SoHo',
  'Office',
  'Shophouse',
  'Land',
  'Room',
]

export const shoplot = defineType({
  name: 'shoplot',
  title: 'Shop Lot',
  type: 'document',
  fields: [
    defineField({
      name: 'listingCode',
      title: 'Listing code',
      type: 'string',
      description: 'The listing ID, e.g. "Sub - 112". Must be unique.',
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          if (!value) return true
          const client = context.getClient({apiVersion: '2025-01-01'})
          const id = context.document?._id.replace(/^drafts\./, '')
          const taken = await client.fetch<boolean>(
            `count(*[_type == "shoplot" && listingCode == $code && !(_id in [$id, $draftId])]) > 0`,
            {code: value, id, draftId: `drafts.${id}`},
          )
          return taken ? 'Another shop lot already uses this code' : true
        }),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description: 'Used in the page URL. Click "Generate" to build it from the listing code.',
      options: {
        source: 'listingCode',
        slugify: (input: string) =>
          input
            .toLowerCase()
            .trim()
            .replace(/[\s-]+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/^-+|-+$/g, ''),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'listingType',
      title: 'Listing type',
      type: 'string',
      options: {
        list: [
          {title: 'For sale', value: 'sale'},
          {title: 'For rent', value: 'rent'},
          {title: 'Room rental', value: 'room-rent'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'sale',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'propertyType',
      title: 'Property type',
      type: 'string',
      options: {
        list: [
          {title: 'Residential', value: 'residential'},
          {title: 'Commercial', value: 'commercial'},
          {title: 'Land', value: 'land'},
        ],
      },
    }),
    defineField({
      name: 'subType',
      title: 'Sub type',
      type: 'string',
      description: `Free text. Common values: ${SUB_TYPE_SUGGESTIONS.join(', ')}`,
    }),
    defineField({
      name: 'price',
      title: 'Price (RM)',
      type: 'number',
      description: 'Monthly rent for rentals. Enter 0 to show "Price on Request".',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'marketValue',
      title: 'Market value (RM)',
      type: 'number',
      description: 'Optional. Shown as "Market Value: RM X" under the price.',
      validation: (rule) => rule.min(0),
    }),
    defineField({name: 'bedrooms', title: 'Bedrooms', type: 'number', validation: (r) => r.min(0)}),
    defineField({name: 'bathrooms', title: 'Bathrooms', type: 'number', validation: (r) => r.min(0)}),
    defineField({
      name: 'carPark',
      title: 'Car park',
      type: 'string',
      description: 'Free text, ranges allowed, e.g. "2-3".',
    }),
    defineField({
      name: 'builtUpSqft',
      title: 'Built-up (sqft)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'landSqft',
      title: 'Land size',
      type: 'string',
      description: 'Free text, dimensions allowed, e.g. "34x75".',
    }),
    defineField({
      name: 'tenure',
      title: 'Tenure',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: ['Freehold', 'Leasehold', 'Tanah Kurnia', 'N/A'],
        layout: 'grid',
      },
    }),
    defineField({
      name: 'lotStatus',
      title: 'Lot status',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: ['Bumiputera Lot', 'International Lot', 'Malay Reserved', 'Non Bumi Lot', 'N/A'],
        layout: 'grid',
      },
    }),
    defineField({
      name: 'furnishing',
      title: 'Furnishing',
      type: 'string',
      options: {
        list: ['Fully Furnished', 'Partially Furnished', 'Unfurnished', 'N/A'],
      },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Available', value: 'available'},
          {title: 'Not available', value: 'not available'},
          {title: 'Sold', value: 'sold'},
          {title: 'Rented', value: 'rented'},
          {title: 'Reserved', value: 'reserved'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'available',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show in the homepage Featured Listings section.',
      initialValue: false,
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
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'areas',
      title: 'Areas',
      type: 'array',
      description: 'One or more areas, e.g. "Pulai Mutiara", "Tampoi". Used by the area filter.',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({name: 'city', title: 'City', type: 'string', initialValue: 'Johor Bahru'}),
    defineField({name: 'state', title: 'State', type: 'string', initialValue: 'Johor'}),
    defineField({name: 'address', title: 'Address', type: 'string'}),
    defineField({
      name: 'mapEmbedUrl',
      title: 'Google Maps embed URL',
      type: 'url',
      description:
        'Only the src URL from Google Maps → Share → Embed a map (starts with https://www.google.com/maps/embed), not the whole <iframe> code.',
      validation: (rule) =>
        rule.uri({scheme: ['https']}).custom((value) =>
          typeof value === 'string' && value.includes('<iframe')
            ? 'Paste only the src="..." URL, not the <iframe> HTML'
            : true,
        ),
    }),
    defineField({
      name: 'postedDate',
      title: 'Posted date',
      type: 'datetime',
      description: 'Controls the "newest" sort order on the site.',
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
    select: {
      title: 'title',
      code: 'listingCode',
      listingType: 'listingType',
      price: 'price',
      media: 'images.0',
    },
    prepare({title, code, listingType, price, media}) {
      const priceText = price ? `RM ${Number(price).toLocaleString('en-MY')}` : 'Price on Request'
      return {
        title: title || code || 'Untitled shop lot',
        subtitle: [listingType, priceText].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
