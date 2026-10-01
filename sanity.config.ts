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
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
