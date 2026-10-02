import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'BalqisMJ Property Admin',

  projectId: 'oul3nr7p',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Listings')
              .schemaType('listing')
              .child(
                S.documentTypeList('listing')
                  .title('Listings')
                  .defaultOrdering([
                    {field: 'postedDate', direction: 'desc'},
                    {field: '_createdAt', direction: 'desc'},
                  ]),
              ),
            S.listItem()
              .title('Rental')
              .schemaType('rental')
              .child(
                S.documentTypeList('rental')
                  .title('Rental')
                  .defaultOrdering([
                    {field: 'postedDate', direction: 'asc'},
                    {field: '_createdAt', direction: 'asc'},
                  ]),
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
