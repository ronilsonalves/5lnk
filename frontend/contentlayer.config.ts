import {
  defineDocumentType,
  defineNestedType,
  makeSource,
} from "contentlayer/source-files";

export const PostContent = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: "blog/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The title of the post",
      required: true,
    },
    date: {
      type: "date",
      description: "The date of the post",
      required: true,
    },
    description: {
      type: "string",
      description: "The description of the post",
      required: true,
    },
    tags: {
      type: "list",
      description: "The tags of the post",
      required: true,
      of: {
        type: "string",
      },
    },
    author: {
      type: "nested",
      of: Author,
      description: "The author of the post",
      required: true,
    },
    imageUrl: {
      type: "string",
      description: "The imageUrl of the post",
      required: true,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (post) => `${post._raw.flattenedPath}`,
    },
  },
}));

export const PageContent = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: "pages/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The title of the page",
      required: true,
    },
    date: {
      type: "date",
      description: "The date of the page",
      required: true,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (page) => `${page._raw.flattenedPath}`,
    },
  },
}))

const Author = defineNestedType(() => ({
  name: "Author",
  fields: {
    name: {
      type: "string",
      description: "The name of the author",
      required: true,
    },
    href: {
      type: "string",
      description: "The href of the author",
      required: true,
    },
    imageUrl: {
      type: "string",
      description: "The imageUrl of the author",
      required: true,
    },
    role: {
      type: "string",
      description: "The role of the author",
      required: true,
    },
  },
}));

export default makeSource({
  contentDirPath: "src/content",
  documentTypes: [PostContent, PageContent],
});