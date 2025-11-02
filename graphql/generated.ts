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
  /** Deletes zero or more records from the `exercises` collection */
  deleteFromexercisesCollection: ExercisesDeleteResponse;
  /** Deletes zero or more records from the `todos` collection */
  deleteFromtodosCollection: TodosDeleteResponse;
  /** Deletes zero or more records from the `user_feedback` collection */
  deleteFromuser_feedbackCollection: User_FeedbackDeleteResponse;
  /** Deletes zero or more records from the `user_profiles` collection */
  deleteFromuser_profilesCollection: User_ProfilesDeleteResponse;
  /** Deletes zero or more records from the `workout_entries` collection */
  deleteFromworkout_entriesCollection: Workout_EntriesDeleteResponse;
  /** Deletes zero or more records from the `workout_plan_requests` collection */
  deleteFromworkout_plan_requestsCollection: Workout_Plan_RequestsDeleteResponse;
  /** Deletes zero or more records from the `workout_plans` collection */
  deleteFromworkout_plansCollection: Workout_PlansDeleteResponse;
  /** Adds one or more `exercises` records to the collection */
  insertIntoexercisesCollection?: Maybe<ExercisesInsertResponse>;
  /** Adds one or more `todos` records to the collection */
  insertIntotodosCollection?: Maybe<TodosInsertResponse>;
  /** Adds one or more `user_feedback` records to the collection */
  insertIntouser_feedbackCollection?: Maybe<User_FeedbackInsertResponse>;
  /** Adds one or more `user_profiles` records to the collection */
  insertIntouser_profilesCollection?: Maybe<User_ProfilesInsertResponse>;
  /** Adds one or more `workout_entries` records to the collection */
  insertIntoworkout_entriesCollection?: Maybe<Workout_EntriesInsertResponse>;
  /** Adds one or more `workout_plan_requests` records to the collection */
  insertIntoworkout_plan_requestsCollection?: Maybe<Workout_Plan_RequestsInsertResponse>;
  /** Adds one or more `workout_plans` records to the collection */
  insertIntoworkout_plansCollection?: Maybe<Workout_PlansInsertResponse>;
  /** Updates zero or more records in the `exercises` collection */
  updateexercisesCollection: ExercisesUpdateResponse;
  /** Updates zero or more records in the `todos` collection */
  updatetodosCollection: TodosUpdateResponse;
  /** Updates zero or more records in the `user_feedback` collection */
  updateuser_feedbackCollection: User_FeedbackUpdateResponse;
  /** Updates zero or more records in the `user_profiles` collection */
  updateuser_profilesCollection: User_ProfilesUpdateResponse;
  /** Updates zero or more records in the `workout_entries` collection */
  updateworkout_entriesCollection: Workout_EntriesUpdateResponse;
  /** Updates zero or more records in the `workout_plan_requests` collection */
  updateworkout_plan_requestsCollection: Workout_Plan_RequestsUpdateResponse;
  /** Updates zero or more records in the `workout_plans` collection */
  updateworkout_plansCollection: Workout_PlansUpdateResponse;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromexercisesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<ExercisesFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromtodosCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<TodosFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromuser_FeedbackCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<User_FeedbackFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromuser_ProfilesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<User_ProfilesFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_EntriesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_EntriesFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_Plan_RequestsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Plan_RequestsFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_PlansCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_PlansFilter>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoexercisesCollectionArgs = {
  objects: Array<ExercisesInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntotodosCollectionArgs = {
  objects: Array<TodosInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntouser_FeedbackCollectionArgs = {
  objects: Array<User_FeedbackInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntouser_ProfilesCollectionArgs = {
  objects: Array<User_ProfilesInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_EntriesCollectionArgs = {
  objects: Array<Workout_EntriesInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_Plan_RequestsCollectionArgs = {
  objects: Array<Workout_Plan_RequestsInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_PlansCollectionArgs = {
  objects: Array<Workout_PlansInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationUpdateexercisesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<ExercisesFilter>;
  set: ExercisesUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdatetodosCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<TodosFilter>;
  set: TodosUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateuser_FeedbackCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<User_FeedbackFilter>;
  set: User_FeedbackUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateuser_ProfilesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<User_ProfilesFilter>;
  set: User_ProfilesUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_EntriesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_EntriesFilter>;
  set: Workout_EntriesUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_Plan_RequestsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Plan_RequestsFilter>;
  set: Workout_Plan_RequestsUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_PlansCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_PlansFilter>;
  set: Workout_PlansUpdateInput;
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
  /** A pagable collection of type `exercises` */
  exercisesCollection?: Maybe<ExercisesConnection>;
  /** Retrieve a record by its `ID` */
  node?: Maybe<Node>;
  /** A pagable collection of type `todos` */
  todosCollection?: Maybe<TodosConnection>;
  /** A pagable collection of type `user_feedback` */
  user_feedbackCollection?: Maybe<User_FeedbackConnection>;
  /** A pagable collection of type `user_profiles` */
  user_profilesCollection?: Maybe<User_ProfilesConnection>;
  /** A pagable collection of type `workout_entries` */
  workout_entriesCollection?: Maybe<Workout_EntriesConnection>;
  /** A pagable collection of type `workout_plan_requests` */
  workout_plan_requestsCollection?: Maybe<Workout_Plan_RequestsConnection>;
  /** A pagable collection of type `workout_plans` */
  workout_plansCollection?: Maybe<Workout_PlansConnection>;
};

/** The root type for querying data */
export type QueryExercisesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<ExercisesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<ExercisesOrderBy>>;
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

/** The root type for querying data */
export type QueryUser_FeedbackCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<User_FeedbackFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<User_FeedbackOrderBy>>;
};

/** The root type for querying data */
export type QueryUser_ProfilesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<User_ProfilesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<User_ProfilesOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_EntriesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_EntriesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_EntriesOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_Plan_RequestsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Plan_RequestsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Plan_RequestsOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_PlansCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_PlansFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_PlansOrderBy>>;
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

export type Exercises = Node & {
  __typename?: "exercises";
  created_at?: Maybe<Scalars["Datetime"]["output"]>;
  equipment_groups: Scalars["JSON"]["output"];
  equipment_text: Scalars["String"]["output"];
  exercise_location: Array<Maybe<Scalars["String"]["output"]>>;
  icon_description: Scalars["String"]["output"];
  id: Scalars["UUID"]["output"];
  instructions: Scalars["String"]["output"];
  muscle_categories?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  name: Scalars["String"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  pain_injury_protocol: Scalars["String"]["output"];
  progression_by_client_feedback: Scalars["String"]["output"];
  rep_limitations_progression_rules: Scalars["String"]["output"];
  slug: Scalars["String"]["output"];
  special_rules_by_location: Scalars["String"]["output"];
  trainer_notes: Scalars["String"]["output"];
  updated_at?: Maybe<Scalars["Datetime"]["output"]>;
  video_description: Scalars["String"]["output"];
  workout_entriesCollection?: Maybe<Workout_EntriesConnection>;
};

export type ExercisesWorkout_EntriesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_EntriesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_EntriesOrderBy>>;
};

export type ExercisesConnection = {
  __typename?: "exercisesConnection";
  edges: Array<ExercisesEdge>;
  pageInfo: PageInfo;
};

export type ExercisesDeleteResponse = {
  __typename?: "exercisesDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Exercises>;
};

export type ExercisesEdge = {
  __typename?: "exercisesEdge";
  cursor: Scalars["String"]["output"];
  node: Exercises;
};

export type ExercisesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ExercisesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  equipment_text?: InputMaybe<StringFilter>;
  exercise_location?: InputMaybe<StringListFilter>;
  icon_description?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  instructions?: InputMaybe<StringFilter>;
  muscle_categories?: InputMaybe<StringListFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ExercisesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ExercisesFilter>>;
  pain_injury_protocol?: InputMaybe<StringFilter>;
  progression_by_client_feedback?: InputMaybe<StringFilter>;
  rep_limitations_progression_rules?: InputMaybe<StringFilter>;
  slug?: InputMaybe<StringFilter>;
  special_rules_by_location?: InputMaybe<StringFilter>;
  trainer_notes?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  video_description?: InputMaybe<StringFilter>;
};

export type ExercisesInsertInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  equipment_groups?: InputMaybe<Scalars["JSON"]["input"]>;
  equipment_text?: InputMaybe<Scalars["String"]["input"]>;
  exercise_location?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  icon_description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  instructions?: InputMaybe<Scalars["String"]["input"]>;
  muscle_categories?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  pain_injury_protocol?: InputMaybe<Scalars["String"]["input"]>;
  progression_by_client_feedback?: InputMaybe<Scalars["String"]["input"]>;
  rep_limitations_progression_rules?: InputMaybe<Scalars["String"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
  special_rules_by_location?: InputMaybe<Scalars["String"]["input"]>;
  trainer_notes?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  video_description?: InputMaybe<Scalars["String"]["input"]>;
};

export type ExercisesInsertResponse = {
  __typename?: "exercisesInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Exercises>;
};

export type ExercisesOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  equipment_text?: InputMaybe<OrderByDirection>;
  icon_description?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  instructions?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  pain_injury_protocol?: InputMaybe<OrderByDirection>;
  progression_by_client_feedback?: InputMaybe<OrderByDirection>;
  rep_limitations_progression_rules?: InputMaybe<OrderByDirection>;
  slug?: InputMaybe<OrderByDirection>;
  special_rules_by_location?: InputMaybe<OrderByDirection>;
  trainer_notes?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  video_description?: InputMaybe<OrderByDirection>;
};

export type ExercisesUpdateInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  equipment_groups?: InputMaybe<Scalars["JSON"]["input"]>;
  equipment_text?: InputMaybe<Scalars["String"]["input"]>;
  exercise_location?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  icon_description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  instructions?: InputMaybe<Scalars["String"]["input"]>;
  muscle_categories?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  pain_injury_protocol?: InputMaybe<Scalars["String"]["input"]>;
  progression_by_client_feedback?: InputMaybe<Scalars["String"]["input"]>;
  rep_limitations_progression_rules?: InputMaybe<Scalars["String"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
  special_rules_by_location?: InputMaybe<Scalars["String"]["input"]>;
  trainer_notes?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  video_description?: InputMaybe<Scalars["String"]["input"]>;
};

export type ExercisesUpdateResponse = {
  __typename?: "exercisesUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Exercises>;
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

export type User_Feedback = Node & {
  __typename?: "user_feedback";
  created_at?: Maybe<Scalars["Datetime"]["output"]>;
  difficulty_rating: Scalars["Int"]["output"];
  feedback_text: Scalars["String"]["output"];
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  week_number: Scalars["Int"]["output"];
  workout_plan_id: Scalars["UUID"]["output"];
  workout_plans?: Maybe<Workout_Plans>;
};

export type User_FeedbackConnection = {
  __typename?: "user_feedbackConnection";
  edges: Array<User_FeedbackEdge>;
  pageInfo: PageInfo;
};

export type User_FeedbackDeleteResponse = {
  __typename?: "user_feedbackDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<User_Feedback>;
};

export type User_FeedbackEdge = {
  __typename?: "user_feedbackEdge";
  cursor: Scalars["String"]["output"];
  node: User_Feedback;
};

export type User_FeedbackFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<User_FeedbackFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  difficulty_rating?: InputMaybe<IntFilter>;
  feedback_text?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<User_FeedbackFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<User_FeedbackFilter>>;
  week_number?: InputMaybe<IntFilter>;
  workout_plan_id?: InputMaybe<UuidFilter>;
};

export type User_FeedbackInsertInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  difficulty_rating?: InputMaybe<Scalars["Int"]["input"]>;
  feedback_text?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  week_number?: InputMaybe<Scalars["Int"]["input"]>;
  workout_plan_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type User_FeedbackInsertResponse = {
  __typename?: "user_feedbackInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<User_Feedback>;
};

export type User_FeedbackOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  difficulty_rating?: InputMaybe<OrderByDirection>;
  feedback_text?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  week_number?: InputMaybe<OrderByDirection>;
  workout_plan_id?: InputMaybe<OrderByDirection>;
};

export type User_FeedbackUpdateInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  difficulty_rating?: InputMaybe<Scalars["Int"]["input"]>;
  feedback_text?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  week_number?: InputMaybe<Scalars["Int"]["input"]>;
  workout_plan_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type User_FeedbackUpdateResponse = {
  __typename?: "user_feedbackUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<User_Feedback>;
};

export type User_Profiles = Node & {
  __typename?: "user_profiles";
  created_at?: Maybe<Scalars["Datetime"]["output"]>;
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  onboarding_answers: Scalars["JSON"]["output"];
  onboarding_completed: Scalars["Boolean"]["output"];
  profile_text: Scalars["String"]["output"];
  updated_at?: Maybe<Scalars["Datetime"]["output"]>;
  user_id: Scalars["UUID"]["output"];
};

export type User_ProfilesConnection = {
  __typename?: "user_profilesConnection";
  edges: Array<User_ProfilesEdge>;
  pageInfo: PageInfo;
};

export type User_ProfilesDeleteResponse = {
  __typename?: "user_profilesDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<User_Profiles>;
};

export type User_ProfilesEdge = {
  __typename?: "user_profilesEdge";
  cursor: Scalars["String"]["output"];
  node: User_Profiles;
};

export type User_ProfilesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<User_ProfilesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<User_ProfilesFilter>;
  onboarding_completed?: InputMaybe<BooleanFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<User_ProfilesFilter>>;
  profile_text?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type User_ProfilesInsertInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  onboarding_answers?: InputMaybe<Scalars["JSON"]["input"]>;
  onboarding_completed?: InputMaybe<Scalars["Boolean"]["input"]>;
  profile_text?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type User_ProfilesInsertResponse = {
  __typename?: "user_profilesInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<User_Profiles>;
};

export type User_ProfilesOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  onboarding_completed?: InputMaybe<OrderByDirection>;
  profile_text?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type User_ProfilesUpdateInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  onboarding_answers?: InputMaybe<Scalars["JSON"]["input"]>;
  onboarding_completed?: InputMaybe<Scalars["Boolean"]["input"]>;
  profile_text?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type User_ProfilesUpdateResponse = {
  __typename?: "user_profilesUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<User_Profiles>;
};

export enum Weekday {
  Friday = "friday",
  Monday = "monday",
  Saturday = "saturday",
  Sunday = "sunday",
  Thursday = "thursday",
  Tuesday = "tuesday",
  Wednesday = "wednesday",
}

/** Boolean expression comparing fields on type "weekday" */
export type WeekdayFilter = {
  eq?: InputMaybe<Weekday>;
  in?: InputMaybe<Array<Weekday>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Weekday>;
};

export type Workout_Entries = Node & {
  __typename?: "workout_entries";
  adjustment_reason?: Maybe<Scalars["String"]["output"]>;
  created_at?: Maybe<Scalars["Datetime"]["output"]>;
  date: Scalars["Date"]["output"];
  day: Weekday;
  day_name: Scalars["String"]["output"];
  exercise_id: Scalars["UUID"]["output"];
  exercises: Exercises;
  id: Scalars["UUID"]["output"];
  is_adjusted?: Maybe<Scalars["Boolean"]["output"]>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  reps: Scalars["String"]["output"];
  sets: Scalars["Int"]["output"];
  streak_exercise_id: Scalars["UUID"]["output"];
  streak_exercise_notes?: Maybe<Scalars["String"]["output"]>;
  time?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["Datetime"]["output"]>;
  week_number: Scalars["Int"]["output"];
  weight?: Maybe<Scalars["String"]["output"]>;
  workout_plan_id: Scalars["UUID"]["output"];
  workout_plans?: Maybe<Workout_Plans>;
};

export type Workout_EntriesConnection = {
  __typename?: "workout_entriesConnection";
  edges: Array<Workout_EntriesEdge>;
  pageInfo: PageInfo;
};

export type Workout_EntriesDeleteResponse = {
  __typename?: "workout_entriesDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Entries>;
};

export type Workout_EntriesEdge = {
  __typename?: "workout_entriesEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Entries;
};

export type Workout_EntriesFilter = {
  adjustment_reason?: InputMaybe<StringFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_EntriesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  date?: InputMaybe<DateFilter>;
  day?: InputMaybe<WeekdayFilter>;
  day_name?: InputMaybe<StringFilter>;
  exercise_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  is_adjusted?: InputMaybe<BooleanFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_EntriesFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_EntriesFilter>>;
  reps?: InputMaybe<StringFilter>;
  sets?: InputMaybe<IntFilter>;
  streak_exercise_id?: InputMaybe<UuidFilter>;
  streak_exercise_notes?: InputMaybe<StringFilter>;
  time?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  week_number?: InputMaybe<IntFilter>;
  weight?: InputMaybe<StringFilter>;
  workout_plan_id?: InputMaybe<UuidFilter>;
};

export type Workout_EntriesInsertInput = {
  adjustment_reason?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  date?: InputMaybe<Scalars["Date"]["input"]>;
  day?: InputMaybe<Weekday>;
  day_name?: InputMaybe<Scalars["String"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  is_adjusted?: InputMaybe<Scalars["Boolean"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  reps?: InputMaybe<Scalars["String"]["input"]>;
  sets?: InputMaybe<Scalars["Int"]["input"]>;
  streak_exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  streak_exercise_notes?: InputMaybe<Scalars["String"]["input"]>;
  time?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  week_number?: InputMaybe<Scalars["Int"]["input"]>;
  weight?: InputMaybe<Scalars["String"]["input"]>;
  workout_plan_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_EntriesInsertResponse = {
  __typename?: "workout_entriesInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Entries>;
};

export type Workout_EntriesOrderBy = {
  adjustment_reason?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  date?: InputMaybe<OrderByDirection>;
  day?: InputMaybe<OrderByDirection>;
  day_name?: InputMaybe<OrderByDirection>;
  exercise_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_adjusted?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  reps?: InputMaybe<OrderByDirection>;
  sets?: InputMaybe<OrderByDirection>;
  streak_exercise_id?: InputMaybe<OrderByDirection>;
  streak_exercise_notes?: InputMaybe<OrderByDirection>;
  time?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  week_number?: InputMaybe<OrderByDirection>;
  weight?: InputMaybe<OrderByDirection>;
  workout_plan_id?: InputMaybe<OrderByDirection>;
};

export type Workout_EntriesUpdateInput = {
  adjustment_reason?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  date?: InputMaybe<Scalars["Date"]["input"]>;
  day?: InputMaybe<Weekday>;
  day_name?: InputMaybe<Scalars["String"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  is_adjusted?: InputMaybe<Scalars["Boolean"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  reps?: InputMaybe<Scalars["String"]["input"]>;
  sets?: InputMaybe<Scalars["Int"]["input"]>;
  streak_exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  streak_exercise_notes?: InputMaybe<Scalars["String"]["input"]>;
  time?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  week_number?: InputMaybe<Scalars["Int"]["input"]>;
  weight?: InputMaybe<Scalars["String"]["input"]>;
  workout_plan_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_EntriesUpdateResponse = {
  __typename?: "workout_entriesUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Entries>;
};

export type Workout_Plan_Requests = Node & {
  __typename?: "workout_plan_requests";
  completed_at?: Maybe<Scalars["Datetime"]["output"]>;
  created_at?: Maybe<Scalars["Datetime"]["output"]>;
  current_step?: Maybe<Scalars["Int"]["output"]>;
  error_message?: Maybe<Scalars["String"]["output"]>;
  exercises_completed?: Maybe<Scalars["Int"]["output"]>;
  exercises_total?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  request_id: Scalars["UUID"]["output"];
  status: Scalars["String"]["output"];
  step_description?: Maybe<Scalars["String"]["output"]>;
  total_steps?: Maybe<Scalars["Int"]["output"]>;
  user_id: Scalars["UUID"]["output"];
  user_profile: Scalars["String"]["output"];
  workout_plan_id?: Maybe<Scalars["UUID"]["output"]>;
  workout_plans?: Maybe<Workout_Plans>;
};

export type Workout_Plan_RequestsConnection = {
  __typename?: "workout_plan_requestsConnection";
  edges: Array<Workout_Plan_RequestsEdge>;
  pageInfo: PageInfo;
};

export type Workout_Plan_RequestsDeleteResponse = {
  __typename?: "workout_plan_requestsDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Plan_Requests>;
};

export type Workout_Plan_RequestsEdge = {
  __typename?: "workout_plan_requestsEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Plan_Requests;
};

export type Workout_Plan_RequestsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Plan_RequestsFilter>>;
  completed_at?: InputMaybe<DatetimeFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  current_step?: InputMaybe<IntFilter>;
  error_message?: InputMaybe<StringFilter>;
  exercises_completed?: InputMaybe<IntFilter>;
  exercises_total?: InputMaybe<IntFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Plan_RequestsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Plan_RequestsFilter>>;
  request_id?: InputMaybe<UuidFilter>;
  status?: InputMaybe<StringFilter>;
  step_description?: InputMaybe<StringFilter>;
  total_steps?: InputMaybe<IntFilter>;
  user_id?: InputMaybe<UuidFilter>;
  user_profile?: InputMaybe<StringFilter>;
  workout_plan_id?: InputMaybe<UuidFilter>;
};

export type Workout_Plan_RequestsInsertInput = {
  completed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  current_step?: InputMaybe<Scalars["Int"]["input"]>;
  error_message?: InputMaybe<Scalars["String"]["input"]>;
  exercises_completed?: InputMaybe<Scalars["Int"]["input"]>;
  exercises_total?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  request_id?: InputMaybe<Scalars["UUID"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  step_description?: InputMaybe<Scalars["String"]["input"]>;
  total_steps?: InputMaybe<Scalars["Int"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
  user_profile?: InputMaybe<Scalars["String"]["input"]>;
  workout_plan_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Plan_RequestsInsertResponse = {
  __typename?: "workout_plan_requestsInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Plan_Requests>;
};

export type Workout_Plan_RequestsOrderBy = {
  completed_at?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  current_step?: InputMaybe<OrderByDirection>;
  error_message?: InputMaybe<OrderByDirection>;
  exercises_completed?: InputMaybe<OrderByDirection>;
  exercises_total?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  request_id?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  step_description?: InputMaybe<OrderByDirection>;
  total_steps?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  user_profile?: InputMaybe<OrderByDirection>;
  workout_plan_id?: InputMaybe<OrderByDirection>;
};

export type Workout_Plan_RequestsUpdateInput = {
  completed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  current_step?: InputMaybe<Scalars["Int"]["input"]>;
  error_message?: InputMaybe<Scalars["String"]["input"]>;
  exercises_completed?: InputMaybe<Scalars["Int"]["input"]>;
  exercises_total?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  request_id?: InputMaybe<Scalars["UUID"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  step_description?: InputMaybe<Scalars["String"]["input"]>;
  total_steps?: InputMaybe<Scalars["Int"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
  user_profile?: InputMaybe<Scalars["String"]["input"]>;
  workout_plan_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Plan_RequestsUpdateResponse = {
  __typename?: "workout_plan_requestsUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Plan_Requests>;
};

export enum Workout_Plan_Status {
  Active = "active",
  Completed = "completed",
  Paused = "paused",
}

/** Boolean expression comparing fields on type "workout_plan_status" */
export type Workout_Plan_StatusFilter = {
  eq?: InputMaybe<Workout_Plan_Status>;
  in?: InputMaybe<Array<Workout_Plan_Status>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Workout_Plan_Status>;
};

export type Workout_Plans = Node & {
  __typename?: "workout_plans";
  created_at?: Maybe<Scalars["Datetime"]["output"]>;
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  start_date: Scalars["Date"]["output"];
  status?: Maybe<Workout_Plan_Status>;
  summary: Scalars["String"]["output"];
  updated_at?: Maybe<Scalars["Datetime"]["output"]>;
  user_feedbackCollection?: Maybe<User_FeedbackConnection>;
  user_id: Scalars["UUID"]["output"];
  workout_entriesCollection?: Maybe<Workout_EntriesConnection>;
  workout_plan_requestsCollection?: Maybe<Workout_Plan_RequestsConnection>;
};

export type Workout_PlansUser_FeedbackCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<User_FeedbackFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<User_FeedbackOrderBy>>;
};

export type Workout_PlansWorkout_EntriesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_EntriesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_EntriesOrderBy>>;
};

export type Workout_PlansWorkout_Plan_RequestsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Plan_RequestsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Plan_RequestsOrderBy>>;
};

export type Workout_PlansConnection = {
  __typename?: "workout_plansConnection";
  edges: Array<Workout_PlansEdge>;
  pageInfo: PageInfo;
};

export type Workout_PlansDeleteResponse = {
  __typename?: "workout_plansDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Plans>;
};

export type Workout_PlansEdge = {
  __typename?: "workout_plansEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Plans;
};

export type Workout_PlansFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_PlansFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_PlansFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_PlansFilter>>;
  start_date?: InputMaybe<DateFilter>;
  status?: InputMaybe<Workout_Plan_StatusFilter>;
  summary?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Workout_PlansInsertInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  start_date?: InputMaybe<Scalars["Date"]["input"]>;
  status?: InputMaybe<Workout_Plan_Status>;
  summary?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_PlansInsertResponse = {
  __typename?: "workout_plansInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Plans>;
};

export type Workout_PlansOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  start_date?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  summary?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Workout_PlansUpdateInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  start_date?: InputMaybe<Scalars["Date"]["input"]>;
  status?: InputMaybe<Workout_Plan_Status>;
  summary?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_PlansUpdateResponse = {
  __typename?: "workout_plansUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Plans>;
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

export type GetWorkoutPlanRequestsQueryVariables = Exact<{
  userId: Scalars["UUID"]["input"];
}>;

export type GetWorkoutPlanRequestsQuery = {
  __typename?: "Query";
  workout_plan_requestsCollection?: {
    __typename?: "workout_plan_requestsConnection";
    edges: Array<{
      __typename?: "workout_plan_requestsEdge";
      node: {
        __typename?: "workout_plan_requests";
        id: any;
        request_id: any;
        status: string;
        workout_plan_id?: any | null;
        error_message?: string | null;
        created_at?: any | null;
        completed_at?: any | null;
        current_step?: number | null;
        total_steps?: number | null;
        step_description?: string | null;
        exercises_total?: number | null;
        exercises_completed?: number | null;
      };
    }>;
  } | null;
};

export type GetWorkoutPlanQueryVariables = Exact<{
  id: Scalars["UUID"]["input"];
}>;

export type GetWorkoutPlanQuery = {
  __typename?: "Query";
  workout_plansCollection?: {
    __typename?: "workout_plansConnection";
    edges: Array<{
      __typename?: "workout_plansEdge";
      node: {
        __typename?: "workout_plans";
        id: any;
        summary: string;
        start_date: any;
        status?: Workout_Plan_Status | null;
        created_at?: any | null;
        workout_entriesCollection?: {
          __typename?: "workout_entriesConnection";
          edges: Array<{
            __typename?: "workout_entriesEdge";
            node: {
              __typename?: "workout_entries";
              id: any;
              week_number: number;
              day_name: string;
              day: Weekday;
              date: any;
              exercise_id: any;
              sets: number;
              reps: string;
              weight?: string | null;
              time?: string | null;
              notes?: string | null;
              streak_exercise_id: any;
              streak_exercise_notes?: string | null;
              exercises: {
                __typename?: "exercises";
                name: string;
                instructions: string;
                equipment_text: string;
                equipment_groups: any;
              };
            };
          }>;
        } | null;
      };
    }>;
  } | null;
};

export type GetUserWorkoutPlansQueryVariables = Exact<{
  userId: Scalars["UUID"]["input"];
}>;

export type GetUserWorkoutPlansQuery = {
  __typename?: "Query";
  workout_plansCollection?: {
    __typename?: "workout_plansConnection";
    edges: Array<{
      __typename?: "workout_plansEdge";
      node: {
        __typename?: "workout_plans";
        id: any;
        summary: string;
        start_date: any;
        status?: Workout_Plan_Status | null;
        created_at?: any | null;
        workout_entriesCollection?: {
          __typename?: "workout_entriesConnection";
          edges: Array<{
            __typename?: "workout_entriesEdge";
            node: {
              __typename?: "workout_entries";
              id: any;
              week_number: number;
              day_name: string;
              day: Weekday;
              exercise_id: any;
              exercises: { __typename?: "exercises"; name: string };
            };
          }>;
        } | null;
      };
    }>;
  } | null;
};

export type DeactivateUserWorkoutPlansMutationVariables = Exact<{
  userId: Scalars["UUID"]["input"];
}>;

export type DeactivateUserWorkoutPlansMutation = {
  __typename?: "Mutation";
  updateworkout_plansCollection: {
    __typename?: "workout_plansUpdateResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_plans";
      id: any;
      status?: Workout_Plan_Status | null;
    }>;
  };
};

export type GetUserProfileQueryVariables = Exact<{
  userId: Scalars["UUID"]["input"];
}>;

export type GetUserProfileQuery = {
  __typename?: "Query";
  user_profilesCollection?: {
    __typename?: "user_profilesConnection";
    edges: Array<{
      __typename?: "user_profilesEdge";
      node: {
        __typename?: "user_profiles";
        id: any;
        user_id: any;
        profile_text: string;
        onboarding_completed: boolean;
        created_at?: any | null;
        updated_at?: any | null;
      };
    }>;
  } | null;
};

export type InsertUserProfileMutationVariables = Exact<{
  userId: Scalars["UUID"]["input"];
  profileText: Scalars["String"]["input"];
  onboardingAnswers: Scalars["JSON"]["input"];
  onboardingCompleted: Scalars["Boolean"]["input"];
}>;

export type InsertUserProfileMutation = {
  __typename?: "Mutation";
  insertIntouser_profilesCollection?: {
    __typename?: "user_profilesInsertResponse";
    records: Array<{
      __typename?: "user_profiles";
      id: any;
      user_id: any;
      profile_text: string;
      onboarding_answers: any;
      onboarding_completed: boolean;
      created_at?: any | null;
      updated_at?: any | null;
    }>;
  } | null;
};

export type UpdateUserProfileMutationVariables = Exact<{
  userId: Scalars["UUID"]["input"];
  profileText: Scalars["String"]["input"];
  onboardingAnswers: Scalars["JSON"]["input"];
  onboardingCompleted: Scalars["Boolean"]["input"];
}>;

export type UpdateUserProfileMutation = {
  __typename?: "Mutation";
  updateuser_profilesCollection: {
    __typename?: "user_profilesUpdateResponse";
    records: Array<{
      __typename?: "user_profiles";
      id: any;
      user_id: any;
      profile_text: string;
      onboarding_answers: any;
      onboarding_completed: boolean;
      created_at?: any | null;
      updated_at?: any | null;
    }>;
  };
};

export type UpdateOnboardingStatusMutationVariables = Exact<{
  userId: Scalars["UUID"]["input"];
  onboardingCompleted: Scalars["Boolean"]["input"];
}>;

export type UpdateOnboardingStatusMutation = {
  __typename?: "Mutation";
  updateuser_profilesCollection: {
    __typename?: "user_profilesUpdateResponse";
    records: Array<{
      __typename?: "user_profiles";
      id: any;
      onboarding_completed: boolean;
      updated_at?: any | null;
    }>;
  };
};

export type GetWorkoutPlanByWeekQueryVariables = Exact<{
  planId: Scalars["UUID"]["input"];
  weekNumber: Scalars["Int"]["input"];
}>;

export type GetWorkoutPlanByWeekQuery = {
  __typename?: "Query";
  workout_plansCollection?: {
    __typename?: "workout_plansConnection";
    edges: Array<{
      __typename?: "workout_plansEdge";
      node: {
        __typename?: "workout_plans";
        id: any;
        summary: string;
        start_date: any;
        status?: Workout_Plan_Status | null;
        created_at?: any | null;
        workout_entriesCollection?: {
          __typename?: "workout_entriesConnection";
          edges: Array<{
            __typename?: "workout_entriesEdge";
            node: {
              __typename?: "workout_entries";
              id: any;
              week_number: number;
              day_name: string;
              day: Weekday;
              date: any;
              exercise_id: any;
              sets: number;
              reps: string;
              weight?: string | null;
              time?: string | null;
              notes?: string | null;
              streak_exercise_id: any;
              streak_exercise_notes?: string | null;
              exercises: {
                __typename?: "exercises";
                name: string;
                instructions: string;
                equipment_text: string;
                equipment_groups: any;
              };
            };
          }>;
        } | null;
      };
    }>;
  } | null;
};

export type GetWorkoutDayQueryVariables = Exact<{
  planId: Scalars["UUID"]["input"];
  weekNumber: Scalars["Int"]["input"];
  day: Weekday;
}>;

export type GetWorkoutDayQuery = {
  __typename?: "Query";
  workout_plansCollection?: {
    __typename?: "workout_plansConnection";
    edges: Array<{
      __typename?: "workout_plansEdge";
      node: {
        __typename?: "workout_plans";
        id: any;
        summary: string;
        start_date: any;
        status?: Workout_Plan_Status | null;
        workout_entriesCollection?: {
          __typename?: "workout_entriesConnection";
          edges: Array<{
            __typename?: "workout_entriesEdge";
            node: {
              __typename?: "workout_entries";
              id: any;
              week_number: number;
              day_name: string;
              day: Weekday;
              date: any;
              exercise_id: any;
              sets: number;
              reps: string;
              weight?: string | null;
              time?: string | null;
              notes?: string | null;
              streak_exercise_id: any;
              streak_exercise_notes?: string | null;
              is_adjusted?: boolean | null;
              adjustment_reason?: string | null;
              exercises: {
                __typename?: "exercises";
                id: any;
                name: string;
                slug: string;
                icon_description: string;
                instructions: string;
                video_description: string;
                equipment_text: string;
                equipment_groups: any;
                exercise_location: Array<string | null>;
                muscle_categories?: Array<string | null> | null;
                rep_limitations_progression_rules: string;
                progression_by_client_feedback: string;
                pain_injury_protocol: string;
                trainer_notes: string;
              };
            };
          }>;
        } | null;
      };
    }>;
  } | null;
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
export const GetWorkoutPlanRequestsDocument = `
    query GetWorkoutPlanRequests($userId: UUID!) {
  workout_plan_requestsCollection(
    filter: {user_id: {eq: $userId}}
    orderBy: [{created_at: DescNullsLast}]
    first: 10
  ) {
    edges {
      node {
        id
        request_id
        status
        workout_plan_id
        error_message
        created_at
        completed_at
        current_step
        total_steps
        step_description
        exercises_total
        exercises_completed
      }
    }
  }
}
    `;
export const GetWorkoutPlanDocument = `
    query GetWorkoutPlan($id: UUID!) {
  workout_plansCollection(filter: {id: {eq: $id}}) {
    edges {
      node {
        id
        summary
        start_date
        status
        created_at
        workout_entriesCollection(
          orderBy: [{week_number: AscNullsLast}, {day: AscNullsLast}]
        ) {
          edges {
            node {
              id
              week_number
              day_name
              day
              date
              exercise_id
              sets
              reps
              weight
              time
              notes
              streak_exercise_id
              streak_exercise_notes
              exercises {
                name
                instructions
                equipment_text
                equipment_groups
              }
            }
          }
        }
      }
    }
  }
}
    `;
export const GetUserWorkoutPlansDocument = `
    query GetUserWorkoutPlans($userId: UUID!) {
  workout_plansCollection(
    filter: {user_id: {eq: $userId}}
    orderBy: [{created_at: DescNullsLast}]
  ) {
    edges {
      node {
        id
        summary
        start_date
        status
        created_at
        workout_entriesCollection(
          orderBy: [{week_number: AscNullsLast}, {day: AscNullsLast}]
        ) {
          edges {
            node {
              id
              week_number
              day_name
              day
              exercise_id
              exercises {
                name
              }
            }
          }
        }
      }
    }
  }
}
    `;
export const DeactivateUserWorkoutPlansDocument = `
    mutation DeactivateUserWorkoutPlans($userId: UUID!) {
  updateworkout_plansCollection(
    filter: {user_id: {eq: $userId}, status: {eq: active}}
    set: {status: paused}
  ) {
    records {
      id
      status
    }
    affectedCount
  }
}
    `;
export const GetUserProfileDocument = `
    query GetUserProfile($userId: UUID!) {
  user_profilesCollection(filter: {user_id: {eq: $userId}}) {
    edges {
      node {
        id
        user_id
        profile_text
        onboarding_completed
        created_at
        updated_at
      }
    }
  }
}
    `;
export const InsertUserProfileDocument = `
    mutation InsertUserProfile($userId: UUID!, $profileText: String!, $onboardingAnswers: JSON!, $onboardingCompleted: Boolean!) {
  insertIntouser_profilesCollection(
    objects: [{user_id: $userId, profile_text: $profileText, onboarding_answers: $onboardingAnswers, onboarding_completed: $onboardingCompleted}]
  ) {
    records {
      id
      user_id
      profile_text
      onboarding_answers
      onboarding_completed
      created_at
      updated_at
    }
  }
}
    `;
export const UpdateUserProfileDocument = `
    mutation UpdateUserProfile($userId: UUID!, $profileText: String!, $onboardingAnswers: JSON!, $onboardingCompleted: Boolean!) {
  updateuser_profilesCollection(
    filter: {user_id: {eq: $userId}}
    set: {profile_text: $profileText, onboarding_answers: $onboardingAnswers, onboarding_completed: $onboardingCompleted}
  ) {
    records {
      id
      user_id
      profile_text
      onboarding_answers
      onboarding_completed
      created_at
      updated_at
    }
  }
}
    `;
export const UpdateOnboardingStatusDocument = `
    mutation UpdateOnboardingStatus($userId: UUID!, $onboardingCompleted: Boolean!) {
  updateuser_profilesCollection(
    filter: {user_id: {eq: $userId}}
    set: {onboarding_completed: $onboardingCompleted}
  ) {
    records {
      id
      onboarding_completed
      updated_at
    }
  }
}
    `;
export const GetWorkoutPlanByWeekDocument = `
    query GetWorkoutPlanByWeek($planId: UUID!, $weekNumber: Int!) {
  workout_plansCollection(filter: {id: {eq: $planId}}) {
    edges {
      node {
        id
        summary
        start_date
        status
        created_at
        workout_entriesCollection(
          filter: {week_number: {eq: $weekNumber}}
          orderBy: [{day: AscNullsLast}]
        ) {
          edges {
            node {
              id
              week_number
              day_name
              day
              date
              exercise_id
              sets
              reps
              weight
              time
              notes
              streak_exercise_id
              streak_exercise_notes
              exercises {
                name
                instructions
                equipment_text
                equipment_groups
              }
            }
          }
        }
      }
    }
  }
}
    `;
export const GetWorkoutDayDocument = `
    query GetWorkoutDay($planId: UUID!, $weekNumber: Int!, $day: weekday!) {
  workout_plansCollection(filter: {id: {eq: $planId}}) {
    edges {
      node {
        id
        summary
        start_date
        status
        workout_entriesCollection(
          filter: {week_number: {eq: $weekNumber}, day: {eq: $day}}
          orderBy: [{created_at: AscNullsLast}]
        ) {
          edges {
            node {
              id
              week_number
              day_name
              day
              date
              exercise_id
              sets
              reps
              weight
              time
              notes
              streak_exercise_id
              streak_exercise_notes
              is_adjusted
              adjustment_reason
              exercises {
                id
                name
                slug
                icon_description
                instructions
                video_description
                equipment_text
                equipment_groups
                exercise_location
                muscle_categories
                rep_limitations_progression_rules
                progression_by_client_feedback
                pain_injury_protocol
                trainer_notes
              }
            }
          }
        }
      }
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
    GetWorkoutPlanRequests: build.query<
      GetWorkoutPlanRequestsQuery,
      GetWorkoutPlanRequestsQueryVariables
    >({
      query: (variables) => ({
        document: GetWorkoutPlanRequestsDocument,
        variables,
      }),
    }),
    GetWorkoutPlan: build.query<
      GetWorkoutPlanQuery,
      GetWorkoutPlanQueryVariables
    >({
      query: (variables) => ({ document: GetWorkoutPlanDocument, variables }),
    }),
    GetUserWorkoutPlans: build.query<
      GetUserWorkoutPlansQuery,
      GetUserWorkoutPlansQueryVariables
    >({
      query: (variables) => ({
        document: GetUserWorkoutPlansDocument,
        variables,
      }),
    }),
    DeactivateUserWorkoutPlans: build.mutation<
      DeactivateUserWorkoutPlansMutation,
      DeactivateUserWorkoutPlansMutationVariables
    >({
      query: (variables) => ({
        document: DeactivateUserWorkoutPlansDocument,
        variables,
      }),
    }),
    GetUserProfile: build.query<
      GetUserProfileQuery,
      GetUserProfileQueryVariables
    >({
      query: (variables) => ({ document: GetUserProfileDocument, variables }),
    }),
    InsertUserProfile: build.mutation<
      InsertUserProfileMutation,
      InsertUserProfileMutationVariables
    >({
      query: (variables) => ({
        document: InsertUserProfileDocument,
        variables,
      }),
    }),
    UpdateUserProfile: build.mutation<
      UpdateUserProfileMutation,
      UpdateUserProfileMutationVariables
    >({
      query: (variables) => ({
        document: UpdateUserProfileDocument,
        variables,
      }),
    }),
    UpdateOnboardingStatus: build.mutation<
      UpdateOnboardingStatusMutation,
      UpdateOnboardingStatusMutationVariables
    >({
      query: (variables) => ({
        document: UpdateOnboardingStatusDocument,
        variables,
      }),
    }),
    GetWorkoutPlanByWeek: build.query<
      GetWorkoutPlanByWeekQuery,
      GetWorkoutPlanByWeekQueryVariables
    >({
      query: (variables) => ({
        document: GetWorkoutPlanByWeekDocument,
        variables,
      }),
    }),
    GetWorkoutDay: build.query<GetWorkoutDayQuery, GetWorkoutDayQueryVariables>(
      {
        query: (variables) => ({ document: GetWorkoutDayDocument, variables }),
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
  useGetWorkoutPlanRequestsQuery,
  useLazyGetWorkoutPlanRequestsQuery,
  useGetWorkoutPlanQuery,
  useLazyGetWorkoutPlanQuery,
  useGetUserWorkoutPlansQuery,
  useLazyGetUserWorkoutPlansQuery,
  useDeactivateUserWorkoutPlansMutation,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useInsertUserProfileMutation,
  useUpdateUserProfileMutation,
  useUpdateOnboardingStatusMutation,
  useGetWorkoutPlanByWeekQuery,
  useLazyGetWorkoutPlanByWeekQuery,
  useGetWorkoutDayQuery,
  useLazyGetWorkoutDayQuery,
} = injectedRtkApi;
