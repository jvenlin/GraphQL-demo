const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require ('graphql')
const app = express();

const authors = [
    { id: 1, name: 'J. K. Rowling'},
    { id: 2, name: 'J. R. R. Tolkien'},
    { id: 3, name: 'Brent Weeks'},
];

const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1},
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1},
    { id: 3, name: 'Harry Potter and the Globet of Fire', authorId: 1},
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2},
    { id: 5, name: 'The Two Towers', authorId: 2},
    { id: 6, name: 'The Return of the King', authorId: 2},
    { id: 7, name: 'The Way of Shadows', authorId: 3},
    { id: 8, name: 'Beyond the Shadows', authorId: 3},
];

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: { 
            type: AuthorType,
            resolve: (books) => {
                return authors.find(author => author.id === books.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents a author of a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        book: { 
            type: new GraphQLList(BookType),
            resolve: (authors) => {
                return books.filter(book => book.authorId === authors.id)
            } 
        },
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A Single book',
            args: {
                id: { type: GraphQLInt },
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'Single Author',
            args: {
                id: { type: GraphQLInt },
            },
            resolve: () => authors.find(author => author.id === args.id)
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a Book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
                authorId : { type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const author = { id: books.length + 1, name: args.name }
                authors.push(author)
                return author
            }
        },
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}))
app.listen(3000, () => console.log('Listening on port 3000'));