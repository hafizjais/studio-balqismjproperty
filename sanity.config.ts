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
              .title('Subsale')
              .schemaType('listing')
              .child(
                S.documentTypeList('listing')
                  .title('Subsale')
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
            S.listItem()
              .title('Shop Lot')
              .schemaType('shoplot')
              .child(
                S.documentTypeList('shoplot')
                  .title('Shop Lot')
                  .defaultOrdering([
                    {field: 'postedDate', direction: 'asc'},
                    {field: '_createdAt', direction: 'asc'},
                  ]),
              ),
            S.listItem()
              .title('Land')
              .schemaType('land')
              .child(
                S.documentTypeList('land')
                  .title('Land')
                  .defaultOrdering([
                    {field: 'postedDate', direction: 'asc'},
                    {field: '_createdAt', direction: 'asc'},
                  ]),
              ),
            S.listItem()
              .title('Project Unit Types')
              .schemaType('projectUnit')
              .child(
                S.documentTypeList('projectUnit')
                  .title('Project Unit Types')
                  .defaultOrdering([{field: 'projectName', direction: 'asc'}]),
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
