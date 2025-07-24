import { api } from "../store/api/baseApi";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  BigFloat: { input: any; output: any };
  BigInt: { input: any; output: any };
  Cursor: { input: any; output: any };
  Date: { input: any; output: any };
  Datetime: { input: any; output: any };
  JSON: { input: any; output: any };
  Opaque: { input: any; output: any };
  Time: { input: any; output: any };
  UUID: { input: any; output: any };
};

/** Boolean expression comparing fields on type "BigFloat" */
export type BigFloatFilter = {
  eq?: InputMaybe<Scalars["BigFloat"]["input"]>;
  gt?: InputMaybe<Scalars["BigFloat"]["input"]>;
  gte?: InputMaybe<Scalars["BigFloat"]["input"]>;
  in?: InputMaybe<Array<Scalars["BigFloat"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars["BigFloat"]["input"]>;
  lte?: InputMaybe<Scalars["BigFloat"]["input"]>;
  neq?: InputMaybe<Scalars["BigFloat"]["input"]>;
};

/** Boolean expression comparing fields on type "BigFloatList" */
export type BigFloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars["BigFloat"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["BigFloat"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["BigFloat"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["BigFloat"]["input"]>>;
};

/** Boolean expression comparing fields on type "BigInt" */
export type BigIntFilter = {
  eq?: InputMaybe<Scalars["BigInt"]["input"]>;
  gt?: InputMaybe<Scalars["BigInt"]["input"]>;
  gte?: InputMaybe<Scalars["BigInt"]["input"]>;
  in?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars["BigInt"]["input"]>;
  lte?: InputMaybe<Scalars["BigInt"]["input"]>;
  neq?: InputMaybe<Scalars["BigInt"]["input"]>;
};

/** Boolean expression comparing fields on type "BigIntList" */
export type BigIntListFilter = {
  containedBy?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["BigInt"]["input"]>>;
};

/** Boolean expression comparing fields on type "Boolean" */
export type BooleanFilter = {
  eq?: InputMaybe<Scalars["Boolean"]["input"]>;
  is?: InputMaybe<FilterIs>;
};

/** Boolean expression comparing fields on type "BooleanList" */
export type BooleanListFilter = {
  containedBy?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
};

/** Boolean expression comparing fields on type "Date" */
export type DateFilter = {
  eq?: InputMaybe<Scalars["Date"]["input"]>;
  gt?: InputMaybe<Scalars["Date"]["input"]>;
  gte?: InputMaybe<Scalars["Date"]["input"]>;
  in?: InputMaybe<Array<Scalars["Date"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars["Date"]["input"]>;
  lte?: InputMaybe<Scalars["Date"]["input"]>;
  neq?: InputMaybe<Scalars["Date"]["input"]>;
};

/** Boolean expression comparing fields on type "DateList" */
export type DateListFilter = {
  containedBy?: InputMaybe<Array<Scalars["Date"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["Date"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["Date"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["Date"]["input"]>>;
};

/** Boolean expression comparing fields on type "Datetime" */
export type DatetimeFilter = {
  eq?: InputMaybe<Scalars["Datetime"]["input"]>;
  gt?: InputMaybe<Scalars["Datetime"]["input"]>;
  gte?: InputMaybe<Scalars["Datetime"]["input"]>;
  in?: InputMaybe<Array<Scalars["Datetime"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars["Datetime"]["input"]>;
  lte?: InputMaybe<Scalars["Datetime"]["input"]>;
  neq?: InputMaybe<Scalars["Datetime"]["input"]>;
};

/** Boolean expression comparing fields on type "DatetimeList" */
export type DatetimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars["Datetime"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["Datetime"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["Datetime"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["Datetime"]["input"]>>;
};

export enum FilterIs {
  NotNull = "NOT_NULL",
  Null = "NULL",
}

/** Boolean expression comparing fields on type "Float" */
export type FloatFilter = {
  eq?: InputMaybe<Scalars["Float"]["input"]>;
  gt?: InputMaybe<Scalars["Float"]["input"]>;
  gte?: InputMaybe<Scalars["Float"]["input"]>;
  in?: InputMaybe<Array<Scalars["Float"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars["Float"]["input"]>;
  lte?: InputMaybe<Scalars["Float"]["input"]>;
  neq?: InputMaybe<Scalars["Float"]["input"]>;
};

/** Boolean expression comparing fields on type "FloatList" */
export type FloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars["Float"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["Float"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["Float"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["Float"]["input"]>>;
};

/** Boolean expression comparing fields on type "ID" */
export type IdFilter = {
  eq?: InputMaybe<Scalars["ID"]["input"]>;
};

/** Boolean expression comparing fields on type "Int" */
export type IntFilter = {
  eq?: InputMaybe<Scalars["Int"]["input"]>;
  gt?: InputMaybe<Scalars["Int"]["input"]>;
  gte?: InputMaybe<Scalars["Int"]["input"]>;
  in?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars["Int"]["input"]>;
  lte?: InputMaybe<Scalars["Int"]["input"]>;
  neq?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Boolean expression comparing fields on type "IntList" */
export type IntListFilter = {
  containedBy?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["Int"]["input"]>>;
};

/** The root type for creating and mutating data */
export type Mutation = {
  __typename?: "Mutation";
  /** Deletes zero or more records from the `todos` collection */
  deleteFromtodosCollection: TodosDeleteResponse;
  /** Adds one or more `todos` records to the collection */
  insertIntotodosCollection?: Maybe<TodosInsertResponse>;
  /** Updates zero or more records in the `todos` collection */
  updatetodosCollection: TodosUpdateResponse;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromtodosCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<TodosFilter>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntotodosCollectionArgs = {
  objects: Array<TodosInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationUpdatetodosCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<TodosFilter>;
  set: TodosUpdateInput;
};

export type Node = {
  /** Retrieves a record by `ID` */
  nodeId: Scalars["ID"]["output"];
};

/** Boolean expression comparing fields on type "Opaque" */
export type OpaqueFilter = {
  eq?: InputMaybe<Scalars["Opaque"]["input"]>;
  is?: InputMaybe<FilterIs>;
};

/** Defines a per-field sorting order */
export enum OrderByDirection {
  /** Ascending order, nulls first */
  AscNullsFirst = "AscNullsFirst",
  /** Ascending order, nulls last */
  AscNullsLast = "AscNullsLast",
  /** Descending order, nulls first */
  DescNullsFirst = "DescNullsFirst",
  /** Descending order, nulls last */
  DescNullsLast = "DescNullsLast",
}

export type PageInfo = {
  __typename?: "PageInfo";
  endCursor?: Maybe<Scalars["String"]["output"]>;
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  startCursor?: Maybe<Scalars["String"]["output"]>;
};

/** The root type for querying data */
export type Query = {
  __typename?: "Query";
  /** Retrieve a record by its `ID` */
  node?: Maybe<Node>;
  /** A pagable collection of type `todos` */
  todosCollection?: Maybe<TodosConnection>;
};

/** The root type for querying data */
export type QueryNodeArgs = {
  nodeId: Scalars["ID"]["input"];
};

/** The root type for querying data */
export type QueryTodosCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<TodosFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<TodosOrderBy>>;
};

/** Boolean expression comparing fields on type "String" */
export type StringFilter = {
  eq?: InputMaybe<Scalars["String"]["input"]>;
  gt?: InputMaybe<Scalars["String"]["input"]>;
  gte?: InputMaybe<Scalars["String"]["input"]>;
  ilike?: InputMaybe<Scalars["String"]["input"]>;
  in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  iregex?: InputMaybe<Scalars["String"]["input"]>;
  is?: InputMaybe<FilterIs>;
  like?: InputMaybe<Scalars["String"]["input"]>;
  lt?: InputMaybe<Scalars["String"]["input"]>;
  lte?: InputMaybe<Scalars["String"]["input"]>;
  neq?: InputMaybe<Scalars["String"]["input"]>;
  regex?: InputMaybe<Scalars["String"]["input"]>;
  startsWith?: InputMaybe<Scalars["String"]["input"]>;
};

/** Boolean expression comparing fields on type "StringList" */
export type StringListFilter = {
  containedBy?: InputMaybe<Array<Scalars["String"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["String"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["String"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

/** Boolean expression comparing fields on type "Time" */
export type TimeFilter = {
  eq?: InputMaybe<Scalars["Time"]["input"]>;
  gt?: InputMaybe<Scalars["Time"]["input"]>;
  gte?: InputMaybe<Scalars["Time"]["input"]>;
  in?: InputMaybe<Array<Scalars["Time"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars["Time"]["input"]>;
  lte?: InputMaybe<Scalars["Time"]["input"]>;
  neq?: InputMaybe<Scalars["Time"]["input"]>;
};

/** Boolean expression comparing fields on type "TimeList" */
export type TimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars["Time"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["Time"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["Time"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["Time"]["input"]>>;
};

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: InputMaybe<Scalars["UUID"]["input"]>;
  in?: InputMaybe<Array<Scalars["UUID"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Scalars["UUID"]["input"]>;
};

/** Boolean expression comparing fields on type "UUIDList" */
export type UuidListFilter = {
  containedBy?: InputMaybe<Array<Scalars["UUID"]["input"]>>;
  contains?: InputMaybe<Array<Scalars["UUID"]["input"]>>;
  eq?: InputMaybe<Array<Scalars["UUID"]["input"]>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars["UUID"]["input"]>>;
};

export type Todos = Node & {
  __typename?: "todos";
  completed?: Maybe<Scalars["Boolean"]["output"]>;
  created_at: Scalars["Datetime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
  updated_at: Scalars["Datetime"]["output"];
  user_id?: Maybe<Scalars["UUID"]["output"]>;
};

export type TodosConnection = {
  __typename?: "todosConnection";
  edges: Array<TodosEdge>;
  pageInfo: PageInfo;
};

export type TodosDeleteResponse = {
  __typename?: "todosDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Todos>;
};

export type TodosEdge = {
  __typename?: "todosEdge";
  cursor: Scalars["String"]["output"];
  node: Todos;
};

export type TodosFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<TodosFilter>>;
  completed?: InputMaybe<BooleanFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  description?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<TodosFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<TodosFilter>>;
  title?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type TodosInsertInput = {
  completed?: InputMaybe<Scalars["Boolean"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type TodosInsertResponse = {
  __typename?: "todosInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Todos>;
};

export type TodosOrderBy = {
  completed?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type TodosUpdateInput = {
  completed?: InputMaybe<Scalars["Boolean"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type TodosUpdateResponse = {
  __typename?: "todosUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Todos>;
};

export type GetTodosQueryVariables = Exact<{ [key: string]: never }>;

export type GetTodosQuery = {
  __typename?: "Query";
  todosCollection?: {
    __typename?: "todosConnection";
    edges: Array<{
      __typename?: "todosEdge";
      node: {
        __typename?: "todos";
        id: any;
        title: string;
        description?: string | null;
        completed?: boolean | null;
        created_at: any;
        updated_at: any;
      };
    }>;
  } | null;
};

export type GetTodoByIdQueryVariables = Exact<{
  id: Scalars["UUID"]["input"];
}>;

export type GetTodoByIdQuery = {
  __typename?: "Query";
  todosCollection?: {
    __typename?: "todosConnection";
    edges: Array<{
      __typename?: "todosEdge";
      node: {
        __typename?: "todos";
        id: any;
        title: string;
        description?: string | null;
        completed?: boolean | null;
        created_at: any;
        updated_at: any;
      };
    }>;
  } | null;
};

export type CreateTodoMutationVariables = Exact<{
  title: Scalars["String"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  completed?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type CreateTodoMutation = {
  __typename?: "Mutation";
  insertIntotodosCollection?: {
    __typename?: "todosInsertResponse";
    records: Array<{
      __typename?: "todos";
      id: any;
      title: string;
      description?: string | null;
      completed?: boolean | null;
      created_at: any;
      updated_at: any;
    }>;
  } | null;
};

export type UpdateTodoMutationVariables = Exact<{
  id: Scalars["UUID"]["input"];
  title?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  completed?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type UpdateTodoMutation = {
  __typename?: "Mutation";
  updatetodosCollection: {
    __typename?: "todosUpdateResponse";
    records: Array<{
      __typename?: "todos";
      id: any;
      title: string;
      description?: string | null;
      completed?: boolean | null;
      created_at: any;
      updated_at: any;
    }>;
  };
};

export type DeleteTodoMutationVariables = Exact<{
  id: Scalars["UUID"]["input"];
}>;

export type DeleteTodoMutation = {
  __typename?: "Mutation";
  deleteFromtodosCollection: {
    __typename?: "todosDeleteResponse";
    records: Array<{ __typename?: "todos"; id: any }>;
  };
};

export const GetTodosDocument = `
    query GetTodos {
  todosCollection {
    edges {
      node {
        id
        title
        description
        completed
        created_at
        updated_at
      }
    }
  }
}
    `;
export const GetTodoByIdDocument = `
    query GetTodoById($id: UUID!) {
  todosCollection(filter: {id: {eq: $id}}) {
    edges {
      node {
        id
        title
        description
        completed
        created_at
        updated_at
      }
    }
  }
}
    `;
export const CreateTodoDocument = `
    mutation CreateTodo($title: String!, $description: String, $completed: Boolean) {
  insertIntotodosCollection(
    objects: [{title: $title, description: $description, completed: $completed}]
  ) {
    records {
      id
      title
      description
      completed
      created_at
      updated_at
    }
  }
}
    `;
export const UpdateTodoDocument = `
    mutation UpdateTodo($id: UUID!, $title: String, $description: String, $completed: Boolean) {
  updatetodosCollection(
    set: {title: $title, description: $description, completed: $completed}
    filter: {id: {eq: $id}}
  ) {
    records {
      id
      title
      description
      completed
      created_at
      updated_at
    }
  }
}
    `;
export const DeleteTodoDocument = `
    mutation DeleteTodo($id: UUID!) {
  deleteFromtodosCollection(filter: {id: {eq: $id}}) {
    records {
      id
    }
  }
}
    `;

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    GetTodos: build.query<GetTodosQuery, GetTodosQueryVariables | void>({
      query: (variables) => ({ document: GetTodosDocument, variables }),
    }),
    GetTodoById: build.query<GetTodoByIdQuery, GetTodoByIdQueryVariables>({
      query: (variables) => ({ document: GetTodoByIdDocument, variables }),
    }),
    CreateTodo: build.mutation<CreateTodoMutation, CreateTodoMutationVariables>(
      {
        query: (variables) => ({ document: CreateTodoDocument, variables }),
      },
    ),
    UpdateTodo: build.mutation<UpdateTodoMutation, UpdateTodoMutationVariables>(
      {
        query: (variables) => ({ document: UpdateTodoDocument, variables }),
      },
    ),
    DeleteTodo: build.mutation<DeleteTodoMutation, DeleteTodoMutationVariables>(
      {
        query: (variables) => ({ document: DeleteTodoDocument, variables }),
      },
    ),
  }),
});

export { injectedRtkApi as api };
export const {
  useGetTodosQuery,
  useLazyGetTodosQuery,
  useGetTodoByIdQuery,
  useLazyGetTodoByIdQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = injectedRtkApi;
