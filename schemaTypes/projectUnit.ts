import {defineArrayMember, defineField, defineType} from 'sanity'

// Mirrors the website's Project / ProjectUnitType shape (BalqisProperty/src/lib/types.ts).
// One document here = one row in the old Airtable "Project" sheet = one unit
// type within a project. Rows sharing the same projectName are grouped into
// a single project page on the website — there's no separate project-code
// field, same as before, so projectName must be spelled identically across
// every unit type belonging to the same project.

export const projectUnit = defineType({
  name: 'projectUnit',
  title: 'Project Unit Type',
  type: 'document',
  fields: [
    defineField({
      name: 'unitId',
      title: 'Unit ID',
      type: 'string',
      description: 'The old row ID, e.g. "Pro - 022". Must be unique.',
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          if (!value) return true
          const client = context.getClient({apiVersion: '2025-01-01'})
          const id = context.document?._id.replace(/^drafts\./, '')
          const taken = await client.fetch<boolean>(
            `count(*[_type == "projectUnit" && unitId == $code && !(_id in [$id, $draftId])]) > 0`,
            {code: value, id, draftId: `drafts.${id}`},
          )
          return taken ? 'Another unit type already uses this ID' : true
        }),
    }),
    defineField({
      name: 'projectName',
      title: 'Project name',
      type: 'string',
      description:
        'Must be spelled EXACTLY the same across every unit type of the same project — this is what groups them into one project page. Double-check spelling before saving.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'developer', title: 'Developer', type: 'string'}),
    defineField({
      name: 'completionYear',
      title: 'Completion',
      type: 'string',
      description: 'Free text — e.g. "Q4 2029", "Completed", or multiple tower dates on separate lines.',
    }),
    defineField({
      name: 'tenure',
      title: 'Tenure',
      type: 'string',
      description: 'e.g. "Freehold", "Leasehold Commercial"',
    }),
    defineField({
      name: 'rebate',
      title: 'Rebate',
      type: 'text',
      rows: 3,
      description: 'Shown only on one row per project — set it on any one unit type.',
    }),
    defineField({
      name: 'description',
      title: 'Project description',
      type: 'text',
      rows: 8,
      description: 'Shown under "About this project" — only the first unit type\'s description is used per project.',
    }),
    defineField({
      name: 'areas',
      title: 'Areas',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({name: 'address', title: 'Address', type: 'string'}),
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
      name: 'gallery',
      title: 'Project photo gallery',
      type: 'array',
      description: 'Project-wide photos. Fill this in on at least one unit type per project.',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
    }),
    defineField({
      name: 'siteFloorMap',
      title: 'Site / master plan photos',
      type: 'array',
      description: 'The project\'s overall site/master plan — shown once per project.',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
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
    defineField({
      name: 'typeName',
      title: 'Unit type name',
      type: 'string',
      description: 'e.g. "Type A", "Type B", "2-Storey Terraced House"',
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'string',
      description: 'Free text — supports layouts like "1+1" or "3+1".',
    }),
    defineField({name: 'bathrooms', title: 'Bathrooms', type: 'number', validation: (r) => r.min(0)}),
    defineField({
      name: 'builtUpSqft',
      title: 'Built-up (sqft)',
      type: 'number',
      description: 'Leave blank if the source value is a dimension (e.g. "20x75") rather than a plain number.',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: 'carPark',
      title: 'Car park',
      type: 'string',
      description: 'Free text, e.g. "1" or "2-3".',
    }),
    defineField({
      name: 'price',
      title: 'Price (RM)',
      type: 'number',
      description: 'Enter 0 to show "Price on Request".',
      initialValue: 0,
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['available', 'sold out'],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'available',
    }),
    defineField({
      name: 'floorPlan',
      title: 'Floor plan',
      type: 'image',
      description: "This unit type's floor plan image.",
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
      title: 'Project name',
      name: 'projectNameAsc',
      by: [{field: 'projectName', direction: 'asc'}],
    },
  ],
  preview: {
    select: {project: 'projectName', typeName: 'typeName', price: 'price', media: 'gallery.0'},
    prepare({project, typeName, price, media}) {
      const priceText = price ? `RM ${Number(price).toLocaleString('en-MY')}` : 'Price on Request'
      return {
        title: project || 'Untitled project',
        subtitle: [typeName, priceText].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
