import {defineArrayMember, defineField, defineType} from 'sanity'

// Mirrors the website's LandListing type (BalqisProperty/src/lib/types.ts).
// Unlike listing/rental/shoplot, the site does NOT slugify the land ID for
// URLs — it uses the raw landId (e.g. "Land - 001") directly as both the
// page URL and the lookup key, so this schema has no slug field.

export const land = defineType({
  name: 'land',
  title: 'Land',
  type: 'document',
  fields: [
    defineField({
      name: 'landId',
      title: 'Land ID',
      type: 'string',
      description: 'The old land ID, e.g. "Land - 001". Must be unique. Used directly in the page URL.',
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          if (!value) return true
          const client = context.getClient({apiVersion: '2025-01-01'})
          const id = context.document?._id.replace(/^drafts\./, '')
          const taken = await client.fetch<boolean>(
            `count(*[_type == "land" && landId == $code && !(_id in [$id, $draftId])]) > 0`,
            {code: value, id, draftId: `drafts.${id}`},
          )
          return taken ? 'Another land listing already uses this ID' : true
        }),
    }),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Free text. Common values: Tanah Pertanian, Tanah Pembangunan',
    }),
    defineField({
      name: 'lotStatus',
      title: 'Lot status',
      type: 'string',
      options: {
        list: ['International Lot', 'Non Bumi Lot', 'Rezab Melayu', 'Bumiputera Lot', 'Malay Reserved', 'N/A'],
      },
    }),
    defineField({
      name: 'ownership',
      title: 'Ownership',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {list: ['Freehold', 'Leasehold'], layout: 'grid'},
    }),
    defineField({
      name: 'rezabTanah',
      title: 'Rezab tanah',
      type: 'string',
      description: 'Reserve-land status, e.g. "Tanah Kurnia" or "Rezab Melayu". Leave blank unless it applies.',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['available', 'not available', 'sold'],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'available',
    }),
    defineField({
      name: 'mukim',
      title: 'Mukim',
      type: 'string',
      description: 'Malaysian sub-district, optional.',
    }),
    defineField({
      name: 'areas',
      title: 'Areas',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({name: 'city', title: 'City', type: 'string', initialValue: 'Johor Bahru'}),
    defineField({name: 'acres', title: 'Acres', type: 'number', validation: (r) => r.min(0)}),
    defineField({
      name: 'buildUpSqft',
      title: 'Buildable sqft',
      type: 'number',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: 'marketValue',
      title: 'Market value (RM)',
      type: 'number',
      description: 'Enter 0 to show "Price on Request".',
      initialValue: 0,
      validation: (rule) => rule.min(0),
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
      name: 'mapEmbedUrl',
      title: 'Google Maps embed URL',
      type: 'url',
      description:
        'Only the src URL from Google Maps → Share → Embed a map, not the whole <iframe> code.',
      validation: (rule) =>
        rule.uri({scheme: ['https']}).custom((value) =>
          typeof value === 'string' && value.includes('<iframe')
            ? 'Paste only the src="..." URL, not the <iframe> HTML'
            : true,
        ),
    }),
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
    select: {title: 'title', landId: 'landId', value: 'marketValue', media: 'images.0'},
    prepare({title, landId, value, media}) {
      const priceText = value ? `RM ${Number(value).toLocaleString('en-MY')}` : 'Price on Request'
      return {
        title: title || landId || 'Untitled land listing',
        subtitle: [landId, priceText].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
