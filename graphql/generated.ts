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
  calculate_total_time_ms?: Maybe<Scalars["BigInt"]["output"]>;
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
  /** Deletes zero or more records from the `workout_entry_alternatives` collection */
  deleteFromworkout_entry_alternativesCollection: Workout_Entry_AlternativesDeleteResponse;
  /** Deletes zero or more records from the `workout_entry_exercise_notes` collection */
  deleteFromworkout_entry_exercise_notesCollection: Workout_Entry_Exercise_NotesDeleteResponse;
  /** Deletes zero or more records from the `workout_plan_requests` collection */
  deleteFromworkout_plan_requestsCollection: Workout_Plan_RequestsDeleteResponse;
  /** Deletes zero or more records from the `workout_plans` collection */
  deleteFromworkout_plansCollection: Workout_PlansDeleteResponse;
  /** Deletes zero or more records from the `workout_preset_entries` collection */
  deleteFromworkout_preset_entriesCollection: Workout_Preset_EntriesDeleteResponse;
  /** Deletes zero or more records from the `workout_preset_entry_alternatives` collection */
  deleteFromworkout_preset_entry_alternativesCollection: Workout_Preset_Entry_AlternativesDeleteResponse;
  /** Deletes zero or more records from the `workout_presets` collection */
  deleteFromworkout_presetsCollection: Workout_PresetsDeleteResponse;
  /** Deletes zero or more records from the `workout_session_adjustments` collection */
  deleteFromworkout_session_adjustmentsCollection: Workout_Session_AdjustmentsDeleteResponse;
  /** Deletes zero or more records from the `workout_session_chat` collection */
  deleteFromworkout_session_chatCollection: Workout_Session_ChatDeleteResponse;
  /** Deletes zero or more records from the `workout_session_sets` collection */
  deleteFromworkout_session_setsCollection: Workout_Session_SetsDeleteResponse;
  /** Deletes zero or more records from the `workout_sessions` collection */
  deleteFromworkout_sessionsCollection: Workout_SessionsDeleteResponse;
  increment_completed_sets?: Maybe<Scalars["Opaque"]["output"]>;
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
  /** Adds one or more `workout_entry_alternatives` records to the collection */
  insertIntoworkout_entry_alternativesCollection?: Maybe<Workout_Entry_AlternativesInsertResponse>;
  /** Adds one or more `workout_entry_exercise_notes` records to the collection */
  insertIntoworkout_entry_exercise_notesCollection?: Maybe<Workout_Entry_Exercise_NotesInsertResponse>;
  /** Adds one or more `workout_plan_requests` records to the collection */
  insertIntoworkout_plan_requestsCollection?: Maybe<Workout_Plan_RequestsInsertResponse>;
  /** Adds one or more `workout_plans` records to the collection */
  insertIntoworkout_plansCollection?: Maybe<Workout_PlansInsertResponse>;
  /** Adds one or more `workout_preset_entries` records to the collection */
  insertIntoworkout_preset_entriesCollection?: Maybe<Workout_Preset_EntriesInsertResponse>;
  /** Adds one or more `workout_preset_entry_alternatives` records to the collection */
  insertIntoworkout_preset_entry_alternativesCollection?: Maybe<Workout_Preset_Entry_AlternativesInsertResponse>;
  /** Adds one or more `workout_presets` records to the collection */
  insertIntoworkout_presetsCollection?: Maybe<Workout_PresetsInsertResponse>;
  /** Adds one or more `workout_session_adjustments` records to the collection */
  insertIntoworkout_session_adjustmentsCollection?: Maybe<Workout_Session_AdjustmentsInsertResponse>;
  /** Adds one or more `workout_session_chat` records to the collection */
  insertIntoworkout_session_chatCollection?: Maybe<Workout_Session_ChatInsertResponse>;
  /** Adds one or more `workout_session_sets` records to the collection */
  insertIntoworkout_session_setsCollection?: Maybe<Workout_Session_SetsInsertResponse>;
  /** Adds one or more `workout_sessions` records to the collection */
  insertIntoworkout_sessionsCollection?: Maybe<Workout_SessionsInsertResponse>;
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
  /** Updates zero or more records in the `workout_entry_alternatives` collection */
  updateworkout_entry_alternativesCollection: Workout_Entry_AlternativesUpdateResponse;
  /** Updates zero or more records in the `workout_entry_exercise_notes` collection */
  updateworkout_entry_exercise_notesCollection: Workout_Entry_Exercise_NotesUpdateResponse;
  /** Updates zero or more records in the `workout_plan_requests` collection */
  updateworkout_plan_requestsCollection: Workout_Plan_RequestsUpdateResponse;
  /** Updates zero or more records in the `workout_plans` collection */
  updateworkout_plansCollection: Workout_PlansUpdateResponse;
  /** Updates zero or more records in the `workout_preset_entries` collection */
  updateworkout_preset_entriesCollection: Workout_Preset_EntriesUpdateResponse;
  /** Updates zero or more records in the `workout_preset_entry_alternatives` collection */
  updateworkout_preset_entry_alternativesCollection: Workout_Preset_Entry_AlternativesUpdateResponse;
  /** Updates zero or more records in the `workout_presets` collection */
  updateworkout_presetsCollection: Workout_PresetsUpdateResponse;
  /** Updates zero or more records in the `workout_session_adjustments` collection */
  updateworkout_session_adjustmentsCollection: Workout_Session_AdjustmentsUpdateResponse;
  /** Updates zero or more records in the `workout_session_chat` collection */
  updateworkout_session_chatCollection: Workout_Session_ChatUpdateResponse;
  /** Updates zero or more records in the `workout_session_sets` collection */
  updateworkout_session_setsCollection: Workout_Session_SetsUpdateResponse;
  /** Updates zero or more records in the `workout_sessions` collection */
  updateworkout_sessionsCollection: Workout_SessionsUpdateResponse;
};

/** The root type for creating and mutating data */
export type MutationCalculate_Total_Time_MsArgs = {
  session_id: Scalars["UUID"]["input"];
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
export type MutationDeleteFromworkout_Entry_AlternativesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Entry_AlternativesFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_Entry_Exercise_NotesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Entry_Exercise_NotesFilter>;
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
export type MutationDeleteFromworkout_Preset_EntriesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Preset_EntriesFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_Preset_Entry_AlternativesCollectionArgs =
  {
    atMost?: Scalars["Int"]["input"];
    filter?: InputMaybe<Workout_Preset_Entry_AlternativesFilter>;
  };

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_PresetsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_PresetsFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_Session_AdjustmentsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Session_AdjustmentsFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_Session_ChatCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Session_ChatFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_Session_SetsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Session_SetsFilter>;
};

/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_SessionsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_SessionsFilter>;
};

/** The root type for creating and mutating data */
export type MutationIncrement_Completed_SetsArgs = {
  session_id: Scalars["UUID"]["input"];
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
export type MutationInsertIntoworkout_Entry_AlternativesCollectionArgs = {
  objects: Array<Workout_Entry_AlternativesInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_Entry_Exercise_NotesCollectionArgs = {
  objects: Array<Workout_Entry_Exercise_NotesInsertInput>;
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
export type MutationInsertIntoworkout_Preset_EntriesCollectionArgs = {
  objects: Array<Workout_Preset_EntriesInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_Preset_Entry_AlternativesCollectionArgs =
  {
    objects: Array<Workout_Preset_Entry_AlternativesInsertInput>;
  };

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_PresetsCollectionArgs = {
  objects: Array<Workout_PresetsInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_Session_AdjustmentsCollectionArgs = {
  objects: Array<Workout_Session_AdjustmentsInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_Session_ChatCollectionArgs = {
  objects: Array<Workout_Session_ChatInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_Session_SetsCollectionArgs = {
  objects: Array<Workout_Session_SetsInsertInput>;
};

/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_SessionsCollectionArgs = {
  objects: Array<Workout_SessionsInsertInput>;
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
export type MutationUpdateworkout_Entry_AlternativesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Entry_AlternativesFilter>;
  set: Workout_Entry_AlternativesUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_Entry_Exercise_NotesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Entry_Exercise_NotesFilter>;
  set: Workout_Entry_Exercise_NotesUpdateInput;
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

/** The root type for creating and mutating data */
export type MutationUpdateworkout_Preset_EntriesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Preset_EntriesFilter>;
  set: Workout_Preset_EntriesUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_Preset_Entry_AlternativesCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Preset_Entry_AlternativesFilter>;
  set: Workout_Preset_Entry_AlternativesUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_PresetsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_PresetsFilter>;
  set: Workout_PresetsUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_Session_AdjustmentsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Session_AdjustmentsFilter>;
  set: Workout_Session_AdjustmentsUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_Session_ChatCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Session_ChatFilter>;
  set: Workout_Session_ChatUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_Session_SetsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_Session_SetsFilter>;
  set: Workout_Session_SetsUpdateInput;
};

/** The root type for creating and mutating data */
export type MutationUpdateworkout_SessionsCollectionArgs = {
  atMost?: Scalars["Int"]["input"];
  filter?: InputMaybe<Workout_SessionsFilter>;
  set: Workout_SessionsUpdateInput;
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
  /** A pagable collection of type `workout_entry_alternatives` */
  workout_entry_alternativesCollection?: Maybe<Workout_Entry_AlternativesConnection>;
  /** A pagable collection of type `workout_entry_exercise_notes` */
  workout_entry_exercise_notesCollection?: Maybe<Workout_Entry_Exercise_NotesConnection>;
  /** A pagable collection of type `workout_plan_requests` */
  workout_plan_requestsCollection?: Maybe<Workout_Plan_RequestsConnection>;
  /** A pagable collection of type `workout_plans` */
  workout_plansCollection?: Maybe<Workout_PlansConnection>;
  /** A pagable collection of type `workout_preset_entries` */
  workout_preset_entriesCollection?: Maybe<Workout_Preset_EntriesConnection>;
  /** A pagable collection of type `workout_preset_entry_alternatives` */
  workout_preset_entry_alternativesCollection?: Maybe<Workout_Preset_Entry_AlternativesConnection>;
  /** A pagable collection of type `workout_presets` */
  workout_presetsCollection?: Maybe<Workout_PresetsConnection>;
  /** A pagable collection of type `workout_session_adjustments` */
  workout_session_adjustmentsCollection?: Maybe<Workout_Session_AdjustmentsConnection>;
  /** A pagable collection of type `workout_session_chat` */
  workout_session_chatCollection?: Maybe<Workout_Session_ChatConnection>;
  /** A pagable collection of type `workout_session_sets` */
  workout_session_setsCollection?: Maybe<Workout_Session_SetsConnection>;
  /** A pagable collection of type `workout_sessions` */
  workout_sessionsCollection?: Maybe<Workout_SessionsConnection>;
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
export type QueryWorkout_Entry_AlternativesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Entry_AlternativesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Entry_AlternativesOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_Entry_Exercise_NotesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Entry_Exercise_NotesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Entry_Exercise_NotesOrderBy>>;
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

/** The root type for querying data */
export type QueryWorkout_Preset_EntriesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Preset_EntriesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Preset_EntriesOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_Preset_Entry_AlternativesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Preset_Entry_AlternativesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Preset_Entry_AlternativesOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_PresetsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_PresetsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_PresetsOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_Session_AdjustmentsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_AdjustmentsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_AdjustmentsOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_Session_ChatCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_ChatFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_ChatOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_Session_SetsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_SetsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_SetsOrderBy>>;
};

/** The root type for querying data */
export type QueryWorkout_SessionsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_SessionsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_SessionsOrderBy>>;
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
  workout_entry_alternativesCollection?: Maybe<Workout_Entry_AlternativesConnection>;
  workout_entry_exercise_notesCollection?: Maybe<Workout_Entry_Exercise_NotesConnection>;
  workout_preset_entriesCollection?: Maybe<Workout_Preset_EntriesConnection>;
  workout_preset_entry_alternativesCollection?: Maybe<Workout_Preset_Entry_AlternativesConnection>;
  workout_session_adjustmentsCollection?: Maybe<Workout_Session_AdjustmentsConnection>;
  workout_session_setsCollection?: Maybe<Workout_Session_SetsConnection>;
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

export type ExercisesWorkout_Entry_AlternativesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Entry_AlternativesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Entry_AlternativesOrderBy>>;
};

export type ExercisesWorkout_Entry_Exercise_NotesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Entry_Exercise_NotesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Entry_Exercise_NotesOrderBy>>;
};

export type ExercisesWorkout_Preset_EntriesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Preset_EntriesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Preset_EntriesOrderBy>>;
};

export type ExercisesWorkout_Preset_Entry_AlternativesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Preset_Entry_AlternativesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Preset_Entry_AlternativesOrderBy>>;
};

export type ExercisesWorkout_Session_AdjustmentsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_AdjustmentsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_AdjustmentsOrderBy>>;
};

export type ExercisesWorkout_Session_SetsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_SetsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_SetsOrderBy>>;
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
  preset_id?: Maybe<Scalars["UUID"]["output"]>;
  reps: Scalars["String"]["output"];
  sets: Scalars["Int"]["output"];
  streak_exercise_id: Scalars["UUID"]["output"];
  streak_exercise_notes?: Maybe<Scalars["String"]["output"]>;
  time?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["Datetime"]["output"]>;
  week_number: Scalars["Int"]["output"];
  weight?: Maybe<Scalars["String"]["output"]>;
  workout_entry_alternativesCollection?: Maybe<Workout_Entry_AlternativesConnection>;
  workout_entry_exercise_notesCollection?: Maybe<Workout_Entry_Exercise_NotesConnection>;
  workout_plan_id: Scalars["UUID"]["output"];
  workout_plans?: Maybe<Workout_Plans>;
  workout_presets?: Maybe<Workout_Presets>;
  workout_session_adjustmentsCollection?: Maybe<Workout_Session_AdjustmentsConnection>;
  workout_session_setsCollection?: Maybe<Workout_Session_SetsConnection>;
};

export type Workout_EntriesWorkout_Entry_AlternativesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Entry_AlternativesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Entry_AlternativesOrderBy>>;
};

export type Workout_EntriesWorkout_Entry_Exercise_NotesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Entry_Exercise_NotesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Entry_Exercise_NotesOrderBy>>;
};

export type Workout_EntriesWorkout_Session_AdjustmentsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_AdjustmentsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_AdjustmentsOrderBy>>;
};

export type Workout_EntriesWorkout_Session_SetsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_SetsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_SetsOrderBy>>;
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
  preset_id?: InputMaybe<UuidFilter>;
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
  preset_id?: InputMaybe<Scalars["UUID"]["input"]>;
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
  preset_id?: InputMaybe<OrderByDirection>;
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
  preset_id?: InputMaybe<Scalars["UUID"]["input"]>;
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

export type Workout_Entry_Alternatives = Node & {
  __typename?: "workout_entry_alternatives";
  alternative_exercise_id: Scalars["UUID"]["output"];
  created_at?: Maybe<Scalars["Datetime"]["output"]>;
  exercises: Exercises;
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  note?: Maybe<Scalars["String"]["output"]>;
  position: Scalars["Int"]["output"];
  workout_entries?: Maybe<Workout_Entries>;
  workout_entry_id: Scalars["UUID"]["output"];
};

export type Workout_Entry_AlternativesConnection = {
  __typename?: "workout_entry_alternativesConnection";
  edges: Array<Workout_Entry_AlternativesEdge>;
  pageInfo: PageInfo;
};

export type Workout_Entry_AlternativesDeleteResponse = {
  __typename?: "workout_entry_alternativesDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Entry_Alternatives>;
};

export type Workout_Entry_AlternativesEdge = {
  __typename?: "workout_entry_alternativesEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Entry_Alternatives;
};

export type Workout_Entry_AlternativesFilter = {
  alternative_exercise_id?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Entry_AlternativesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Entry_AlternativesFilter>;
  note?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Entry_AlternativesFilter>>;
  position?: InputMaybe<IntFilter>;
  workout_entry_id?: InputMaybe<UuidFilter>;
};

export type Workout_Entry_AlternativesInsertInput = {
  alternative_exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  note?: InputMaybe<Scalars["String"]["input"]>;
  position?: InputMaybe<Scalars["Int"]["input"]>;
  workout_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Entry_AlternativesInsertResponse = {
  __typename?: "workout_entry_alternativesInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Entry_Alternatives>;
};

export type Workout_Entry_AlternativesOrderBy = {
  alternative_exercise_id?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  note?: InputMaybe<OrderByDirection>;
  position?: InputMaybe<OrderByDirection>;
  workout_entry_id?: InputMaybe<OrderByDirection>;
};

export type Workout_Entry_AlternativesUpdateInput = {
  alternative_exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  note?: InputMaybe<Scalars["String"]["input"]>;
  position?: InputMaybe<Scalars["Int"]["input"]>;
  workout_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Entry_AlternativesUpdateResponse = {
  __typename?: "workout_entry_alternativesUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Entry_Alternatives>;
};

export type Workout_Entry_Exercise_Notes = Node & {
  __typename?: "workout_entry_exercise_notes";
  created_at?: Maybe<Scalars["Datetime"]["output"]>;
  exercise_id: Scalars["UUID"]["output"];
  exercises: Exercises;
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  note: Scalars["String"]["output"];
  updated_at?: Maybe<Scalars["Datetime"]["output"]>;
  workout_entries?: Maybe<Workout_Entries>;
  workout_entry_id: Scalars["UUID"]["output"];
};

export type Workout_Entry_Exercise_NotesConnection = {
  __typename?: "workout_entry_exercise_notesConnection";
  edges: Array<Workout_Entry_Exercise_NotesEdge>;
  pageInfo: PageInfo;
};

export type Workout_Entry_Exercise_NotesDeleteResponse = {
  __typename?: "workout_entry_exercise_notesDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Entry_Exercise_Notes>;
};

export type Workout_Entry_Exercise_NotesEdge = {
  __typename?: "workout_entry_exercise_notesEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Entry_Exercise_Notes;
};

export type Workout_Entry_Exercise_NotesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Entry_Exercise_NotesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  exercise_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Entry_Exercise_NotesFilter>;
  note?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Entry_Exercise_NotesFilter>>;
  updated_at?: InputMaybe<DatetimeFilter>;
  workout_entry_id?: InputMaybe<UuidFilter>;
};

export type Workout_Entry_Exercise_NotesInsertInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  note?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  workout_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Entry_Exercise_NotesInsertResponse = {
  __typename?: "workout_entry_exercise_notesInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Entry_Exercise_Notes>;
};

export type Workout_Entry_Exercise_NotesOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  exercise_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  note?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  workout_entry_id?: InputMaybe<OrderByDirection>;
};

export type Workout_Entry_Exercise_NotesUpdateInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  note?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  workout_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Entry_Exercise_NotesUpdateResponse = {
  __typename?: "workout_entry_exercise_notesUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Entry_Exercise_Notes>;
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
  workout_sessionsCollection?: Maybe<Workout_SessionsConnection>;
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

export type Workout_PlansWorkout_SessionsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_SessionsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_SessionsOrderBy>>;
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

export type Workout_Preset_Entries = Node & {
  __typename?: "workout_preset_entries";
  created_at: Scalars["Datetime"]["output"];
  exercise_id: Scalars["UUID"]["output"];
  exercises?: Maybe<Exercises>;
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  position: Scalars["Int"]["output"];
  preset_id: Scalars["UUID"]["output"];
  reps: Scalars["String"]["output"];
  sets: Scalars["Int"]["output"];
  streak_exercise_id?: Maybe<Scalars["UUID"]["output"]>;
  streak_exercise_notes?: Maybe<Scalars["String"]["output"]>;
  time?: Maybe<Scalars["String"]["output"]>;
  updated_at: Scalars["Datetime"]["output"];
  weight?: Maybe<Scalars["String"]["output"]>;
  workout_preset_entry_alternativesCollection?: Maybe<Workout_Preset_Entry_AlternativesConnection>;
  workout_presets?: Maybe<Workout_Presets>;
};

export type Workout_Preset_EntriesWorkout_Preset_Entry_AlternativesCollectionArgs =
  {
    after?: InputMaybe<Scalars["Cursor"]["input"]>;
    before?: InputMaybe<Scalars["Cursor"]["input"]>;
    filter?: InputMaybe<Workout_Preset_Entry_AlternativesFilter>;
    first?: InputMaybe<Scalars["Int"]["input"]>;
    last?: InputMaybe<Scalars["Int"]["input"]>;
    offset?: InputMaybe<Scalars["Int"]["input"]>;
    orderBy?: InputMaybe<Array<Workout_Preset_Entry_AlternativesOrderBy>>;
  };

export type Workout_Preset_EntriesConnection = {
  __typename?: "workout_preset_entriesConnection";
  edges: Array<Workout_Preset_EntriesEdge>;
  pageInfo: PageInfo;
};

export type Workout_Preset_EntriesDeleteResponse = {
  __typename?: "workout_preset_entriesDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Preset_Entries>;
};

export type Workout_Preset_EntriesEdge = {
  __typename?: "workout_preset_entriesEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Preset_Entries;
};

export type Workout_Preset_EntriesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Preset_EntriesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  exercise_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Preset_EntriesFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Preset_EntriesFilter>>;
  position?: InputMaybe<IntFilter>;
  preset_id?: InputMaybe<UuidFilter>;
  reps?: InputMaybe<StringFilter>;
  sets?: InputMaybe<IntFilter>;
  streak_exercise_id?: InputMaybe<UuidFilter>;
  streak_exercise_notes?: InputMaybe<StringFilter>;
  time?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  weight?: InputMaybe<StringFilter>;
};

export type Workout_Preset_EntriesInsertInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  position?: InputMaybe<Scalars["Int"]["input"]>;
  preset_id?: InputMaybe<Scalars["UUID"]["input"]>;
  reps?: InputMaybe<Scalars["String"]["input"]>;
  sets?: InputMaybe<Scalars["Int"]["input"]>;
  streak_exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  streak_exercise_notes?: InputMaybe<Scalars["String"]["input"]>;
  time?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  weight?: InputMaybe<Scalars["String"]["input"]>;
};

export type Workout_Preset_EntriesInsertResponse = {
  __typename?: "workout_preset_entriesInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Preset_Entries>;
};

export type Workout_Preset_EntriesOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  exercise_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  position?: InputMaybe<OrderByDirection>;
  preset_id?: InputMaybe<OrderByDirection>;
  reps?: InputMaybe<OrderByDirection>;
  sets?: InputMaybe<OrderByDirection>;
  streak_exercise_id?: InputMaybe<OrderByDirection>;
  streak_exercise_notes?: InputMaybe<OrderByDirection>;
  time?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  weight?: InputMaybe<OrderByDirection>;
};

export type Workout_Preset_EntriesUpdateInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  position?: InputMaybe<Scalars["Int"]["input"]>;
  preset_id?: InputMaybe<Scalars["UUID"]["input"]>;
  reps?: InputMaybe<Scalars["String"]["input"]>;
  sets?: InputMaybe<Scalars["Int"]["input"]>;
  streak_exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  streak_exercise_notes?: InputMaybe<Scalars["String"]["input"]>;
  time?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  weight?: InputMaybe<Scalars["String"]["input"]>;
};

export type Workout_Preset_EntriesUpdateResponse = {
  __typename?: "workout_preset_entriesUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Preset_Entries>;
};

export type Workout_Preset_Entry_Alternatives = Node & {
  __typename?: "workout_preset_entry_alternatives";
  alternative_exercise_id: Scalars["UUID"]["output"];
  created_at: Scalars["Datetime"]["output"];
  exercises: Exercises;
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  note?: Maybe<Scalars["String"]["output"]>;
  position: Scalars["Int"]["output"];
  preset_entry_id: Scalars["UUID"]["output"];
  workout_preset_entries?: Maybe<Workout_Preset_Entries>;
};

export type Workout_Preset_Entry_AlternativesConnection = {
  __typename?: "workout_preset_entry_alternativesConnection";
  edges: Array<Workout_Preset_Entry_AlternativesEdge>;
  pageInfo: PageInfo;
};

export type Workout_Preset_Entry_AlternativesDeleteResponse = {
  __typename?: "workout_preset_entry_alternativesDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Preset_Entry_Alternatives>;
};

export type Workout_Preset_Entry_AlternativesEdge = {
  __typename?: "workout_preset_entry_alternativesEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Preset_Entry_Alternatives;
};

export type Workout_Preset_Entry_AlternativesFilter = {
  alternative_exercise_id?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Preset_Entry_AlternativesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Preset_Entry_AlternativesFilter>;
  note?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Preset_Entry_AlternativesFilter>>;
  position?: InputMaybe<IntFilter>;
  preset_entry_id?: InputMaybe<UuidFilter>;
};

export type Workout_Preset_Entry_AlternativesInsertInput = {
  alternative_exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  note?: InputMaybe<Scalars["String"]["input"]>;
  position?: InputMaybe<Scalars["Int"]["input"]>;
  preset_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Preset_Entry_AlternativesInsertResponse = {
  __typename?: "workout_preset_entry_alternativesInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Preset_Entry_Alternatives>;
};

export type Workout_Preset_Entry_AlternativesOrderBy = {
  alternative_exercise_id?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  note?: InputMaybe<OrderByDirection>;
  position?: InputMaybe<OrderByDirection>;
  preset_entry_id?: InputMaybe<OrderByDirection>;
};

export type Workout_Preset_Entry_AlternativesUpdateInput = {
  alternative_exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  note?: InputMaybe<Scalars["String"]["input"]>;
  position?: InputMaybe<Scalars["Int"]["input"]>;
  preset_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Preset_Entry_AlternativesUpdateResponse = {
  __typename?: "workout_preset_entry_alternativesUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Preset_Entry_Alternatives>;
};

export type Workout_Presets = Node & {
  __typename?: "workout_presets";
  created_at: Scalars["Datetime"]["output"];
  day_name: Scalars["String"]["output"];
  description: Scalars["String"]["output"];
  difficulty: Scalars["String"]["output"];
  estimated_duration: Scalars["Int"]["output"];
  id: Scalars["UUID"]["output"];
  image_key?: Maybe<Scalars["String"]["output"]>;
  is_active: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  sort_order: Scalars["Int"]["output"];
  updated_at: Scalars["Datetime"]["output"];
  workout_entriesCollection?: Maybe<Workout_EntriesConnection>;
  workout_preset_entriesCollection?: Maybe<Workout_Preset_EntriesConnection>;
};

export type Workout_PresetsWorkout_EntriesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_EntriesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_EntriesOrderBy>>;
};

export type Workout_PresetsWorkout_Preset_EntriesCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Preset_EntriesFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Preset_EntriesOrderBy>>;
};

export type Workout_PresetsConnection = {
  __typename?: "workout_presetsConnection";
  edges: Array<Workout_PresetsEdge>;
  pageInfo: PageInfo;
};

export type Workout_PresetsDeleteResponse = {
  __typename?: "workout_presetsDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Presets>;
};

export type Workout_PresetsEdge = {
  __typename?: "workout_presetsEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Presets;
};

export type Workout_PresetsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_PresetsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  day_name?: InputMaybe<StringFilter>;
  description?: InputMaybe<StringFilter>;
  difficulty?: InputMaybe<StringFilter>;
  estimated_duration?: InputMaybe<IntFilter>;
  id?: InputMaybe<UuidFilter>;
  image_key?: InputMaybe<StringFilter>;
  is_active?: InputMaybe<BooleanFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_PresetsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_PresetsFilter>>;
  sort_order?: InputMaybe<IntFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type Workout_PresetsInsertInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  day_name?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  difficulty?: InputMaybe<Scalars["String"]["input"]>;
  estimated_duration?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  image_key?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  sort_order?: InputMaybe<Scalars["Int"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
};

export type Workout_PresetsInsertResponse = {
  __typename?: "workout_presetsInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Presets>;
};

export type Workout_PresetsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  day_name?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  difficulty?: InputMaybe<OrderByDirection>;
  estimated_duration?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  image_key?: InputMaybe<OrderByDirection>;
  is_active?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  sort_order?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type Workout_PresetsUpdateInput = {
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  day_name?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  difficulty?: InputMaybe<Scalars["String"]["input"]>;
  estimated_duration?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  image_key?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  sort_order?: InputMaybe<Scalars["Int"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
};

export type Workout_PresetsUpdateResponse = {
  __typename?: "workout_presetsUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Presets>;
};

export type Workout_Session_Adjustments = Node & {
  __typename?: "workout_session_adjustments";
  affected_set_numbers?: Maybe<Array<Maybe<Scalars["Int"]["output"]>>>;
  affects_future_sets?: Maybe<Scalars["Boolean"]["output"]>;
  created_at: Scalars["Datetime"]["output"];
  exercise_id?: Maybe<Scalars["UUID"]["output"]>;
  exercises?: Maybe<Exercises>;
  from_value: Scalars["String"]["output"];
  id: Scalars["UUID"]["output"];
  is_applied?: Maybe<Scalars["Boolean"]["output"]>;
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  reason: Scalars["String"]["output"];
  session_id: Scalars["UUID"]["output"];
  to_value: Scalars["String"]["output"];
  type: Scalars["String"]["output"];
  workout_entries?: Maybe<Workout_Entries>;
  workout_entry_id?: Maybe<Scalars["UUID"]["output"]>;
  workout_sessions?: Maybe<Workout_Sessions>;
};

export type Workout_Session_AdjustmentsConnection = {
  __typename?: "workout_session_adjustmentsConnection";
  edges: Array<Workout_Session_AdjustmentsEdge>;
  pageInfo: PageInfo;
};

export type Workout_Session_AdjustmentsDeleteResponse = {
  __typename?: "workout_session_adjustmentsDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Session_Adjustments>;
};

export type Workout_Session_AdjustmentsEdge = {
  __typename?: "workout_session_adjustmentsEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Session_Adjustments;
};

export type Workout_Session_AdjustmentsFilter = {
  affected_set_numbers?: InputMaybe<IntListFilter>;
  affects_future_sets?: InputMaybe<BooleanFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Session_AdjustmentsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  exercise_id?: InputMaybe<UuidFilter>;
  from_value?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  is_applied?: InputMaybe<BooleanFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Session_AdjustmentsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Session_AdjustmentsFilter>>;
  reason?: InputMaybe<StringFilter>;
  session_id?: InputMaybe<UuidFilter>;
  to_value?: InputMaybe<StringFilter>;
  type?: InputMaybe<StringFilter>;
  workout_entry_id?: InputMaybe<UuidFilter>;
};

export type Workout_Session_AdjustmentsInsertInput = {
  affected_set_numbers?: InputMaybe<Array<InputMaybe<Scalars["Int"]["input"]>>>;
  affects_future_sets?: InputMaybe<Scalars["Boolean"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  from_value?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  is_applied?: InputMaybe<Scalars["Boolean"]["input"]>;
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
  reason?: InputMaybe<Scalars["String"]["input"]>;
  session_id?: InputMaybe<Scalars["UUID"]["input"]>;
  to_value?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  workout_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Session_AdjustmentsInsertResponse = {
  __typename?: "workout_session_adjustmentsInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Session_Adjustments>;
};

export type Workout_Session_AdjustmentsOrderBy = {
  affects_future_sets?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  exercise_id?: InputMaybe<OrderByDirection>;
  from_value?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_applied?: InputMaybe<OrderByDirection>;
  reason?: InputMaybe<OrderByDirection>;
  session_id?: InputMaybe<OrderByDirection>;
  to_value?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  workout_entry_id?: InputMaybe<OrderByDirection>;
};

export type Workout_Session_AdjustmentsUpdateInput = {
  affected_set_numbers?: InputMaybe<Array<InputMaybe<Scalars["Int"]["input"]>>>;
  affects_future_sets?: InputMaybe<Scalars["Boolean"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  from_value?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  is_applied?: InputMaybe<Scalars["Boolean"]["input"]>;
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
  reason?: InputMaybe<Scalars["String"]["input"]>;
  session_id?: InputMaybe<Scalars["UUID"]["input"]>;
  to_value?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  workout_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Session_AdjustmentsUpdateResponse = {
  __typename?: "workout_session_adjustmentsUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Session_Adjustments>;
};

export type Workout_Session_Chat = Node & {
  __typename?: "workout_session_chat";
  conversation_id: Scalars["String"]["output"];
  created_at: Scalars["Datetime"]["output"];
  details?: Maybe<Scalars["String"]["output"]>;
  event_type: Scalars["String"]["output"];
  id: Scalars["UUID"]["output"];
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  session_id: Scalars["UUID"]["output"];
  timestamp: Scalars["Datetime"]["output"];
  workout_sessions?: Maybe<Workout_Sessions>;
};

export type Workout_Session_ChatConnection = {
  __typename?: "workout_session_chatConnection";
  edges: Array<Workout_Session_ChatEdge>;
  pageInfo: PageInfo;
};

export type Workout_Session_ChatDeleteResponse = {
  __typename?: "workout_session_chatDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Session_Chat>;
};

export type Workout_Session_ChatEdge = {
  __typename?: "workout_session_chatEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Session_Chat;
};

export type Workout_Session_ChatFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Session_ChatFilter>>;
  conversation_id?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  details?: InputMaybe<StringFilter>;
  event_type?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Session_ChatFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Session_ChatFilter>>;
  session_id?: InputMaybe<UuidFilter>;
  timestamp?: InputMaybe<DatetimeFilter>;
};

export type Workout_Session_ChatInsertInput = {
  conversation_id?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  details?: InputMaybe<Scalars["String"]["input"]>;
  event_type?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  session_id?: InputMaybe<Scalars["UUID"]["input"]>;
  timestamp?: InputMaybe<Scalars["Datetime"]["input"]>;
};

export type Workout_Session_ChatInsertResponse = {
  __typename?: "workout_session_chatInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Session_Chat>;
};

export type Workout_Session_ChatOrderBy = {
  conversation_id?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  details?: InputMaybe<OrderByDirection>;
  event_type?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  session_id?: InputMaybe<OrderByDirection>;
  timestamp?: InputMaybe<OrderByDirection>;
};

export type Workout_Session_ChatUpdateInput = {
  conversation_id?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  details?: InputMaybe<Scalars["String"]["input"]>;
  event_type?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  session_id?: InputMaybe<Scalars["UUID"]["input"]>;
  timestamp?: InputMaybe<Scalars["Datetime"]["input"]>;
};

export type Workout_Session_ChatUpdateResponse = {
  __typename?: "workout_session_chatUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Session_Chat>;
};

export type Workout_Session_Sets = Node & {
  __typename?: "workout_session_sets";
  actual_reps?: Maybe<Scalars["Int"]["output"]>;
  actual_time?: Maybe<Scalars["Int"]["output"]>;
  actual_weight?: Maybe<Scalars["BigFloat"]["output"]>;
  completed_at: Scalars["Datetime"]["output"];
  created_at: Scalars["Datetime"]["output"];
  difficulty?: Maybe<Scalars["String"]["output"]>;
  exercise_id: Scalars["UUID"]["output"];
  exercises: Exercises;
  id: Scalars["UUID"]["output"];
  is_completed?: Maybe<Scalars["Boolean"]["output"]>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  pause_time_ms?: Maybe<Scalars["BigInt"]["output"]>;
  rest_completed_at?: Maybe<Scalars["Datetime"]["output"]>;
  rest_duration_seconds?: Maybe<Scalars["Int"]["output"]>;
  rest_extended?: Maybe<Scalars["Boolean"]["output"]>;
  rest_started_at?: Maybe<Scalars["Datetime"]["output"]>;
  session_id: Scalars["UUID"]["output"];
  set_number: Scalars["Int"]["output"];
  skipped?: Maybe<Scalars["Boolean"]["output"]>;
  started_at?: Maybe<Scalars["Datetime"]["output"]>;
  target_reps?: Maybe<Scalars["Int"]["output"]>;
  target_time?: Maybe<Scalars["Int"]["output"]>;
  target_weight?: Maybe<Scalars["BigFloat"]["output"]>;
  user_notes?: Maybe<Scalars["String"]["output"]>;
  workout_entries?: Maybe<Workout_Entries>;
  workout_entry_id: Scalars["UUID"]["output"];
  workout_sessions?: Maybe<Workout_Sessions>;
};

export type Workout_Session_SetsConnection = {
  __typename?: "workout_session_setsConnection";
  edges: Array<Workout_Session_SetsEdge>;
  pageInfo: PageInfo;
};

export type Workout_Session_SetsDeleteResponse = {
  __typename?: "workout_session_setsDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Session_Sets>;
};

export type Workout_Session_SetsEdge = {
  __typename?: "workout_session_setsEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Session_Sets;
};

export type Workout_Session_SetsFilter = {
  actual_reps?: InputMaybe<IntFilter>;
  actual_time?: InputMaybe<IntFilter>;
  actual_weight?: InputMaybe<BigFloatFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Session_SetsFilter>>;
  completed_at?: InputMaybe<DatetimeFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  difficulty?: InputMaybe<StringFilter>;
  exercise_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  is_completed?: InputMaybe<BooleanFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Session_SetsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Session_SetsFilter>>;
  pause_time_ms?: InputMaybe<BigIntFilter>;
  rest_completed_at?: InputMaybe<DatetimeFilter>;
  rest_duration_seconds?: InputMaybe<IntFilter>;
  rest_extended?: InputMaybe<BooleanFilter>;
  rest_started_at?: InputMaybe<DatetimeFilter>;
  session_id?: InputMaybe<UuidFilter>;
  set_number?: InputMaybe<IntFilter>;
  skipped?: InputMaybe<BooleanFilter>;
  started_at?: InputMaybe<DatetimeFilter>;
  target_reps?: InputMaybe<IntFilter>;
  target_time?: InputMaybe<IntFilter>;
  target_weight?: InputMaybe<BigFloatFilter>;
  user_notes?: InputMaybe<StringFilter>;
  workout_entry_id?: InputMaybe<UuidFilter>;
};

export type Workout_Session_SetsInsertInput = {
  actual_reps?: InputMaybe<Scalars["Int"]["input"]>;
  actual_time?: InputMaybe<Scalars["Int"]["input"]>;
  actual_weight?: InputMaybe<Scalars["BigFloat"]["input"]>;
  completed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  difficulty?: InputMaybe<Scalars["String"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  is_completed?: InputMaybe<Scalars["Boolean"]["input"]>;
  pause_time_ms?: InputMaybe<Scalars["BigInt"]["input"]>;
  rest_completed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  rest_duration_seconds?: InputMaybe<Scalars["Int"]["input"]>;
  rest_extended?: InputMaybe<Scalars["Boolean"]["input"]>;
  rest_started_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  session_id?: InputMaybe<Scalars["UUID"]["input"]>;
  set_number?: InputMaybe<Scalars["Int"]["input"]>;
  skipped?: InputMaybe<Scalars["Boolean"]["input"]>;
  started_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  target_reps?: InputMaybe<Scalars["Int"]["input"]>;
  target_time?: InputMaybe<Scalars["Int"]["input"]>;
  target_weight?: InputMaybe<Scalars["BigFloat"]["input"]>;
  user_notes?: InputMaybe<Scalars["String"]["input"]>;
  workout_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Session_SetsInsertResponse = {
  __typename?: "workout_session_setsInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Session_Sets>;
};

export type Workout_Session_SetsOrderBy = {
  actual_reps?: InputMaybe<OrderByDirection>;
  actual_time?: InputMaybe<OrderByDirection>;
  actual_weight?: InputMaybe<OrderByDirection>;
  completed_at?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  difficulty?: InputMaybe<OrderByDirection>;
  exercise_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_completed?: InputMaybe<OrderByDirection>;
  pause_time_ms?: InputMaybe<OrderByDirection>;
  rest_completed_at?: InputMaybe<OrderByDirection>;
  rest_duration_seconds?: InputMaybe<OrderByDirection>;
  rest_extended?: InputMaybe<OrderByDirection>;
  rest_started_at?: InputMaybe<OrderByDirection>;
  session_id?: InputMaybe<OrderByDirection>;
  set_number?: InputMaybe<OrderByDirection>;
  skipped?: InputMaybe<OrderByDirection>;
  started_at?: InputMaybe<OrderByDirection>;
  target_reps?: InputMaybe<OrderByDirection>;
  target_time?: InputMaybe<OrderByDirection>;
  target_weight?: InputMaybe<OrderByDirection>;
  user_notes?: InputMaybe<OrderByDirection>;
  workout_entry_id?: InputMaybe<OrderByDirection>;
};

export type Workout_Session_SetsUpdateInput = {
  actual_reps?: InputMaybe<Scalars["Int"]["input"]>;
  actual_time?: InputMaybe<Scalars["Int"]["input"]>;
  actual_weight?: InputMaybe<Scalars["BigFloat"]["input"]>;
  completed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  difficulty?: InputMaybe<Scalars["String"]["input"]>;
  exercise_id?: InputMaybe<Scalars["UUID"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  is_completed?: InputMaybe<Scalars["Boolean"]["input"]>;
  pause_time_ms?: InputMaybe<Scalars["BigInt"]["input"]>;
  rest_completed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  rest_duration_seconds?: InputMaybe<Scalars["Int"]["input"]>;
  rest_extended?: InputMaybe<Scalars["Boolean"]["input"]>;
  rest_started_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  session_id?: InputMaybe<Scalars["UUID"]["input"]>;
  set_number?: InputMaybe<Scalars["Int"]["input"]>;
  skipped?: InputMaybe<Scalars["Boolean"]["input"]>;
  started_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  target_reps?: InputMaybe<Scalars["Int"]["input"]>;
  target_time?: InputMaybe<Scalars["Int"]["input"]>;
  target_weight?: InputMaybe<Scalars["BigFloat"]["input"]>;
  user_notes?: InputMaybe<Scalars["String"]["input"]>;
  workout_entry_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_Session_SetsUpdateResponse = {
  __typename?: "workout_session_setsUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Session_Sets>;
};

export type Workout_Sessions = Node & {
  __typename?: "workout_sessions";
  completed_at?: Maybe<Scalars["Datetime"]["output"]>;
  completed_exercises?: Maybe<Scalars["Int"]["output"]>;
  completed_sets?: Maybe<Scalars["Int"]["output"]>;
  created_at: Scalars["Datetime"]["output"];
  current_exercise_index?: Maybe<Scalars["Int"]["output"]>;
  current_set_index?: Maybe<Scalars["Int"]["output"]>;
  date: Scalars["Date"]["output"];
  day: Weekday;
  day_name: Scalars["String"]["output"];
  finished_early?: Maybe<Scalars["Boolean"]["output"]>;
  id: Scalars["UUID"]["output"];
  is_fully_completed?: Maybe<Scalars["Boolean"]["output"]>;
  last_activity_at?: Maybe<Scalars["Datetime"]["output"]>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars["ID"]["output"];
  paused_at?: Maybe<Scalars["Datetime"]["output"]>;
  resumed_at?: Maybe<Scalars["Datetime"]["output"]>;
  started_at: Scalars["Datetime"]["output"];
  status: Scalars["String"]["output"];
  total_exercises: Scalars["Int"]["output"];
  total_pause_time_ms?: Maybe<Scalars["BigInt"]["output"]>;
  total_sets: Scalars["Int"]["output"];
  total_time_ms?: Maybe<Scalars["BigInt"]["output"]>;
  updated_at: Scalars["Datetime"]["output"];
  user_id: Scalars["UUID"]["output"];
  week_number: Scalars["Int"]["output"];
  workout_plan_id: Scalars["UUID"]["output"];
  workout_plans?: Maybe<Workout_Plans>;
  workout_session_adjustmentsCollection?: Maybe<Workout_Session_AdjustmentsConnection>;
  workout_session_chatCollection?: Maybe<Workout_Session_ChatConnection>;
  workout_session_setsCollection?: Maybe<Workout_Session_SetsConnection>;
};

export type Workout_SessionsWorkout_Session_AdjustmentsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_AdjustmentsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_AdjustmentsOrderBy>>;
};

export type Workout_SessionsWorkout_Session_ChatCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_ChatFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_ChatOrderBy>>;
};

export type Workout_SessionsWorkout_Session_SetsCollectionArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  filter?: InputMaybe<Workout_Session_SetsFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<Workout_Session_SetsOrderBy>>;
};

export type Workout_SessionsConnection = {
  __typename?: "workout_sessionsConnection";
  edges: Array<Workout_SessionsEdge>;
  pageInfo: PageInfo;
};

export type Workout_SessionsDeleteResponse = {
  __typename?: "workout_sessionsDeleteResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Sessions>;
};

export type Workout_SessionsEdge = {
  __typename?: "workout_sessionsEdge";
  cursor: Scalars["String"]["output"];
  node: Workout_Sessions;
};

export type Workout_SessionsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_SessionsFilter>>;
  completed_at?: InputMaybe<DatetimeFilter>;
  completed_exercises?: InputMaybe<IntFilter>;
  completed_sets?: InputMaybe<IntFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  current_exercise_index?: InputMaybe<IntFilter>;
  current_set_index?: InputMaybe<IntFilter>;
  date?: InputMaybe<DateFilter>;
  day?: InputMaybe<WeekdayFilter>;
  day_name?: InputMaybe<StringFilter>;
  finished_early?: InputMaybe<BooleanFilter>;
  id?: InputMaybe<UuidFilter>;
  is_fully_completed?: InputMaybe<BooleanFilter>;
  last_activity_at?: InputMaybe<DatetimeFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_SessionsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_SessionsFilter>>;
  paused_at?: InputMaybe<DatetimeFilter>;
  resumed_at?: InputMaybe<DatetimeFilter>;
  started_at?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<StringFilter>;
  total_exercises?: InputMaybe<IntFilter>;
  total_pause_time_ms?: InputMaybe<BigIntFilter>;
  total_sets?: InputMaybe<IntFilter>;
  total_time_ms?: InputMaybe<BigIntFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
  week_number?: InputMaybe<IntFilter>;
  workout_plan_id?: InputMaybe<UuidFilter>;
};

export type Workout_SessionsInsertInput = {
  completed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  completed_exercises?: InputMaybe<Scalars["Int"]["input"]>;
  completed_sets?: InputMaybe<Scalars["Int"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  current_exercise_index?: InputMaybe<Scalars["Int"]["input"]>;
  current_set_index?: InputMaybe<Scalars["Int"]["input"]>;
  date?: InputMaybe<Scalars["Date"]["input"]>;
  day?: InputMaybe<Weekday>;
  day_name?: InputMaybe<Scalars["String"]["input"]>;
  finished_early?: InputMaybe<Scalars["Boolean"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  is_fully_completed?: InputMaybe<Scalars["Boolean"]["input"]>;
  last_activity_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  paused_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  resumed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  started_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  total_exercises?: InputMaybe<Scalars["Int"]["input"]>;
  total_pause_time_ms?: InputMaybe<Scalars["BigInt"]["input"]>;
  total_sets?: InputMaybe<Scalars["Int"]["input"]>;
  total_time_ms?: InputMaybe<Scalars["BigInt"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
  week_number?: InputMaybe<Scalars["Int"]["input"]>;
  workout_plan_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_SessionsInsertResponse = {
  __typename?: "workout_sessionsInsertResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Sessions>;
};

export type Workout_SessionsOrderBy = {
  completed_at?: InputMaybe<OrderByDirection>;
  completed_exercises?: InputMaybe<OrderByDirection>;
  completed_sets?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  current_exercise_index?: InputMaybe<OrderByDirection>;
  current_set_index?: InputMaybe<OrderByDirection>;
  date?: InputMaybe<OrderByDirection>;
  day?: InputMaybe<OrderByDirection>;
  day_name?: InputMaybe<OrderByDirection>;
  finished_early?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_fully_completed?: InputMaybe<OrderByDirection>;
  last_activity_at?: InputMaybe<OrderByDirection>;
  paused_at?: InputMaybe<OrderByDirection>;
  resumed_at?: InputMaybe<OrderByDirection>;
  started_at?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  total_exercises?: InputMaybe<OrderByDirection>;
  total_pause_time_ms?: InputMaybe<OrderByDirection>;
  total_sets?: InputMaybe<OrderByDirection>;
  total_time_ms?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  week_number?: InputMaybe<OrderByDirection>;
  workout_plan_id?: InputMaybe<OrderByDirection>;
};

export type Workout_SessionsUpdateInput = {
  completed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  completed_exercises?: InputMaybe<Scalars["Int"]["input"]>;
  completed_sets?: InputMaybe<Scalars["Int"]["input"]>;
  created_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  current_exercise_index?: InputMaybe<Scalars["Int"]["input"]>;
  current_set_index?: InputMaybe<Scalars["Int"]["input"]>;
  date?: InputMaybe<Scalars["Date"]["input"]>;
  day?: InputMaybe<Weekday>;
  day_name?: InputMaybe<Scalars["String"]["input"]>;
  finished_early?: InputMaybe<Scalars["Boolean"]["input"]>;
  id?: InputMaybe<Scalars["UUID"]["input"]>;
  is_fully_completed?: InputMaybe<Scalars["Boolean"]["input"]>;
  last_activity_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  paused_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  resumed_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  started_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  total_exercises?: InputMaybe<Scalars["Int"]["input"]>;
  total_pause_time_ms?: InputMaybe<Scalars["BigInt"]["input"]>;
  total_sets?: InputMaybe<Scalars["Int"]["input"]>;
  total_time_ms?: InputMaybe<Scalars["BigInt"]["input"]>;
  updated_at?: InputMaybe<Scalars["Datetime"]["input"]>;
  user_id?: InputMaybe<Scalars["UUID"]["input"]>;
  week_number?: InputMaybe<Scalars["Int"]["input"]>;
  workout_plan_id?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type Workout_SessionsUpdateResponse = {
  __typename?: "workout_sessionsUpdateResponse";
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars["Int"]["output"];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Sessions>;
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
              workout_entry_alternativesCollection?: {
                __typename?: "workout_entry_alternativesConnection";
                edges: Array<{
                  __typename?: "workout_entry_alternativesEdge";
                  node: {
                    __typename?: "workout_entry_alternatives";
                    id: any;
                    alternative_exercise_id: any;
                    note?: string | null;
                    position: number;
                    exercises: {
                      __typename?: "exercises";
                      id: any;
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
              workout_entry_alternativesCollection?: {
                __typename?: "workout_entry_alternativesConnection";
                edges: Array<{
                  __typename?: "workout_entry_alternativesEdge";
                  node: {
                    __typename?: "workout_entry_alternatives";
                    id: any;
                    alternative_exercise_id: any;
                    note?: string | null;
                    position: number;
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
    }>;
  } | null;
};

export type SwapExerciseWithAlternativeMutationVariables = Exact<{
  workoutEntryId: Scalars["UUID"]["input"];
  newExerciseId: Scalars["UUID"]["input"];
  alternativeNote?: InputMaybe<Scalars["String"]["input"]>;
  planId?: InputMaybe<Scalars["UUID"]["input"]>;
  weekNumber?: InputMaybe<Scalars["Int"]["input"]>;
  day?: InputMaybe<Weekday>;
}>;

export type SwapExerciseWithAlternativeMutation = {
  __typename?: "Mutation";
  updateworkout_entriesCollection: {
    __typename?: "workout_entriesUpdateResponse";
    records: Array<{
      __typename?: "workout_entries";
      id: any;
      exercise_id: any;
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
    }>;
  };
};

export type UpdateWorkoutEntryMutationVariables = Exact<{
  id: Scalars["UUID"]["input"];
  sets?: InputMaybe<Scalars["Int"]["input"]>;
  reps?: InputMaybe<Scalars["String"]["input"]>;
  weight?: InputMaybe<Scalars["String"]["input"]>;
  time?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  isAdjusted?: InputMaybe<Scalars["Boolean"]["input"]>;
  adjustmentReason?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type UpdateWorkoutEntryMutation = {
  __typename?: "Mutation";
  updateworkout_entriesCollection: {
    __typename?: "workout_entriesUpdateResponse";
    affectedCount: number;
    records: Array<{
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
      workout_entry_alternativesCollection?: {
        __typename?: "workout_entry_alternativesConnection";
        edges: Array<{
          __typename?: "workout_entry_alternativesEdge";
          node: {
            __typename?: "workout_entry_alternatives";
            id: any;
            alternative_exercise_id: any;
            note?: string | null;
            position: number;
            exercises: {
              __typename?: "exercises";
              id: any;
              name: string;
              slug: string;
              equipment_groups: any;
            };
          };
        }>;
      } | null;
    }>;
  };
};

export type AddWorkoutEntryMutationVariables = Exact<{
  workoutPlanId: Scalars["UUID"]["input"];
  weekNumber: Scalars["Int"]["input"];
  dayName: Scalars["String"]["input"];
  day: Weekday;
  date: Scalars["Date"]["input"];
  exerciseId: Scalars["UUID"]["input"];
  sets: Scalars["Int"]["input"];
  reps: Scalars["String"]["input"];
  streakExerciseId: Scalars["UUID"]["input"];
  weight?: InputMaybe<Scalars["String"]["input"]>;
  time?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type AddWorkoutEntryMutation = {
  __typename?: "Mutation";
  insertIntoworkout_entriesCollection?: {
    __typename?: "workout_entriesInsertResponse";
    affectedCount: number;
    records: Array<{
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
      workout_entry_alternativesCollection?: {
        __typename?: "workout_entry_alternativesConnection";
        edges: Array<{
          __typename?: "workout_entry_alternativesEdge";
          node: {
            __typename?: "workout_entry_alternatives";
            id: any;
            alternative_exercise_id: any;
            note?: string | null;
            position: number;
            exercises: {
              __typename?: "exercises";
              id: any;
              name: string;
              slug: string;
              equipment_groups: any;
            };
          };
        }>;
      } | null;
    }>;
  } | null;
};

export type DeleteWorkoutEntryMutationVariables = Exact<{
  id: Scalars["UUID"]["input"];
}>;

export type DeleteWorkoutEntryMutation = {
  __typename?: "Mutation";
  deleteFromworkout_entriesCollection: {
    __typename?: "workout_entriesDeleteResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_entries";
      id: any;
      exercise_id: any;
      sets: number;
      reps: string;
      weight?: string | null;
      time?: string | null;
      notes?: string | null;
      streak_exercise_id: any;
      streak_exercise_notes?: string | null;
    }>;
  };
};

export type GetWorkoutEntryBasicQueryVariables = Exact<{
  id: Scalars["UUID"]["input"];
}>;

export type GetWorkoutEntryBasicQuery = {
  __typename?: "Query";
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
        workout_plans?: { __typename?: "workout_plans"; id: any } | null;
        workout_entry_alternativesCollection?: {
          __typename?: "workout_entry_alternativesConnection";
          edges: Array<{
            __typename?: "workout_entry_alternativesEdge";
            node: {
              __typename?: "workout_entry_alternatives";
              id: any;
              alternative_exercise_id: any;
              note?: string | null;
              position: number;
            };
          }>;
        } | null;
      };
    }>;
  } | null;
};

export type GetWorkoutEntryQueryVariables = Exact<{
  id: Scalars["UUID"]["input"];
}>;

export type GetWorkoutEntryQuery = {
  __typename?: "Query";
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
        workout_plans?: { __typename?: "workout_plans"; id: any } | null;
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
        workout_entry_alternativesCollection?: {
          __typename?: "workout_entry_alternativesConnection";
          edges: Array<{
            __typename?: "workout_entry_alternativesEdge";
            node: {
              __typename?: "workout_entry_alternatives";
              id: any;
              alternative_exercise_id: any;
              note?: string | null;
              position: number;
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

export type GetExerciseByIdQueryVariables = Exact<{
  id: Scalars["UUID"]["input"];
}>;

export type GetExerciseByIdQuery = {
  __typename?: "Query";
  exercisesCollection?: {
    __typename?: "exercisesConnection";
    edges: Array<{
      __typename?: "exercisesEdge";
      node: {
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
    }>;
  } | null;
};

export type GetAllExercisesQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
}>;

export type GetAllExercisesQuery = {
  __typename?: "Query";
  exercisesCollection?: {
    __typename?: "exercisesConnection";
    pageInfo: {
      __typename?: "PageInfo";
      hasNextPage: boolean;
      endCursor?: string | null;
    };
    edges: Array<{
      __typename?: "exercisesEdge";
      cursor: string;
      node: {
        __typename?: "exercises";
        id: any;
        name: string;
        slug: string;
        muscle_categories?: Array<string | null> | null;
        equipment_groups: any;
        exercise_location: Array<string | null>;
      };
    }>;
  } | null;
};

export type GetWorkoutPresetsQueryVariables = Exact<{ [key: string]: never }>;

export type GetWorkoutPresetsQuery = {
  __typename?: "Query";
  workout_presetsCollection?: {
    __typename?: "workout_presetsConnection";
    edges: Array<{
      __typename?: "workout_presetsEdge";
      node: {
        __typename?: "workout_presets";
        id: any;
        name: string;
        description: string;
        day_name: string;
        image_key?: string | null;
        difficulty: string;
        estimated_duration: number;
        sort_order: number;
      };
    }>;
  } | null;
};

export type GetWorkoutPresetQueryVariables = Exact<{
  id: Scalars["UUID"]["input"];
}>;

export type GetWorkoutPresetQuery = {
  __typename?: "Query";
  workout_presetsCollection?: {
    __typename?: "workout_presetsConnection";
    edges: Array<{
      __typename?: "workout_presetsEdge";
      node: {
        __typename?: "workout_presets";
        id: any;
        name: string;
        description: string;
        day_name: string;
        image_key?: string | null;
        difficulty: string;
        estimated_duration: number;
        workout_preset_entriesCollection?: {
          __typename?: "workout_preset_entriesConnection";
          edges: Array<{
            __typename?: "workout_preset_entriesEdge";
            node: {
              __typename?: "workout_preset_entries";
              id: any;
              exercise_id: any;
              position: number;
              sets: number;
              reps: string;
              weight?: string | null;
              time?: string | null;
              notes?: string | null;
              streak_exercise_id?: any | null;
              streak_exercise_notes?: string | null;
              exercises?: {
                __typename?: "exercises";
                id: any;
                name: string;
                slug: string;
                icon_description: string;
                instructions: string;
                video_description: string;
                equipment_text: string;
                equipment_groups: any;
                muscle_categories?: Array<string | null> | null;
              } | null;
              workout_preset_entry_alternativesCollection?: {
                __typename?: "workout_preset_entry_alternativesConnection";
                edges: Array<{
                  __typename?: "workout_preset_entry_alternativesEdge";
                  node: {
                    __typename?: "workout_preset_entry_alternatives";
                    id: any;
                    alternative_exercise_id: any;
                    note?: string | null;
                    position: number;
                    exercises: {
                      __typename?: "exercises";
                      id: any;
                      name: string;
                      slug: string;
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
    }>;
  } | null;
};

export type GetWorkoutPresetsWithCountsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetWorkoutPresetsWithCountsQuery = {
  __typename?: "Query";
  workout_presetsCollection?: {
    __typename?: "workout_presetsConnection";
    edges: Array<{
      __typename?: "workout_presetsEdge";
      node: {
        __typename?: "workout_presets";
        id: any;
        name: string;
        description: string;
        day_name: string;
        image_key?: string | null;
        difficulty: string;
        estimated_duration: number;
        workout_preset_entriesCollection?: {
          __typename?: "workout_preset_entriesConnection";
          edges: Array<{
            __typename?: "workout_preset_entriesEdge";
            node: {
              __typename?: "workout_preset_entries";
              id: any;
              sets: number;
            };
          }>;
        } | null;
      };
    }>;
  } | null;
};

export type GetWorkoutSessionByDateQueryVariables = Exact<{
  workoutPlanId: Scalars["UUID"]["input"];
  date: Scalars["Date"]["input"];
}>;

export type GetWorkoutSessionByDateQuery = {
  __typename?: "Query";
  workout_sessionsCollection?: {
    __typename?: "workout_sessionsConnection";
    edges: Array<{
      __typename?: "workout_sessionsEdge";
      node: {
        __typename?: "workout_sessions";
        id: any;
        status: string;
        completed_exercises?: number | null;
        completed_sets?: number | null;
        total_exercises: number;
        total_sets: number;
        total_time_ms?: any | null;
        is_fully_completed?: boolean | null;
        finished_early?: boolean | null;
      };
    }>;
  } | null;
};

export type GetWorkoutEntriesPresetIdQueryVariables = Exact<{
  workoutPlanId: Scalars["UUID"]["input"];
  date: Scalars["Date"]["input"];
}>;

export type GetWorkoutEntriesPresetIdQuery = {
  __typename?: "Query";
  workout_entriesCollection?: {
    __typename?: "workout_entriesConnection";
    edges: Array<{
      __typename?: "workout_entriesEdge";
      node: { __typename?: "workout_entries"; preset_id?: any | null };
    }>;
  } | null;
};

export type GetUserWorkoutStatisticsQueryVariables = Exact<{
  userId: Scalars["UUID"]["input"];
}>;

export type GetUserWorkoutStatisticsQuery = {
  __typename?: "Query";
  workout_sessionsCollection?: {
    __typename?: "workout_sessionsConnection";
    edges: Array<{
      __typename?: "workout_sessionsEdge";
      node: {
        __typename?: "workout_sessions";
        id: any;
        status: string;
        completed_at?: any | null;
        completed_exercises?: number | null;
        completed_sets?: number | null;
        total_exercises: number;
        total_sets: number;
        total_time_ms?: any | null;
        is_fully_completed?: boolean | null;
        workout_session_setsCollection?: {
          __typename?: "workout_session_setsConnection";
          edges: Array<{
            __typename?: "workout_session_setsEdge";
            node: {
              __typename?: "workout_session_sets";
              id: any;
              actual_reps?: number | null;
              actual_weight?: any | null;
              is_completed?: boolean | null;
            };
          }>;
        } | null;
      };
    }>;
  } | null;
};

export type GetWorkoutSessionQueryVariables = Exact<{
  id: Scalars["UUID"]["input"];
}>;

export type GetWorkoutSessionQuery = {
  __typename?: "Query";
  workout_sessionsCollection?: {
    __typename?: "workout_sessionsConnection";
    edges: Array<{
      __typename?: "workout_sessionsEdge";
      node: {
        __typename?: "workout_sessions";
        id: any;
        user_id: any;
        workout_plan_id: any;
        week_number: number;
        day: Weekday;
        day_name: string;
        date: any;
        status: string;
        started_at: any;
        completed_at?: any | null;
        paused_at?: any | null;
        resumed_at?: any | null;
        current_exercise_index?: number | null;
        current_set_index?: number | null;
        completed_exercises?: number | null;
        completed_sets?: number | null;
        total_exercises: number;
        total_sets: number;
        total_time_ms?: any | null;
        total_pause_time_ms?: any | null;
        last_activity_at?: any | null;
        is_fully_completed?: boolean | null;
        finished_early?: boolean | null;
        created_at: any;
        updated_at: any;
      };
    }>;
  } | null;
};

export type GetActiveWorkoutSessionQueryVariables = Exact<{
  userId: Scalars["UUID"]["input"];
}>;

export type GetActiveWorkoutSessionQuery = {
  __typename?: "Query";
  workout_sessionsCollection?: {
    __typename?: "workout_sessionsConnection";
    edges: Array<{
      __typename?: "workout_sessionsEdge";
      node: {
        __typename?: "workout_sessions";
        id: any;
        workout_plan_id: any;
        week_number: number;
        day: Weekday;
        day_name: string;
        date: any;
        status: string;
        started_at: any;
        paused_at?: any | null;
        resumed_at?: any | null;
        current_exercise_index?: number | null;
        current_set_index?: number | null;
        completed_exercises?: number | null;
        completed_sets?: number | null;
        total_exercises: number;
        total_sets: number;
        total_time_ms?: any | null;
        total_pause_time_ms?: any | null;
        last_activity_at?: any | null;
        is_fully_completed?: boolean | null;
        finished_early?: boolean | null;
      };
    }>;
  } | null;
};

export type GetWorkoutSessionSetsQueryVariables = Exact<{
  sessionId: Scalars["UUID"]["input"];
}>;

export type GetWorkoutSessionSetsQuery = {
  __typename?: "Query";
  workout_session_setsCollection?: {
    __typename?: "workout_session_setsConnection";
    edges: Array<{
      __typename?: "workout_session_setsEdge";
      node: {
        __typename?: "workout_session_sets";
        id: any;
        session_id: any;
        workout_entry_id: any;
        exercise_id: any;
        set_number: number;
        target_reps?: number | null;
        target_weight?: any | null;
        target_time?: number | null;
        actual_reps?: number | null;
        actual_weight?: any | null;
        actual_time?: number | null;
        difficulty?: string | null;
        user_notes?: string | null;
        started_at?: any | null;
        completed_at: any;
        is_completed?: boolean | null;
        skipped?: boolean | null;
        created_at: any;
        workout_entries?: {
          __typename?: "workout_entries";
          preset_id?: any | null;
        } | null;
      };
    }>;
  } | null;
};

export type GetWorkoutSessionAdjustmentsQueryVariables = Exact<{
  sessionId: Scalars["UUID"]["input"];
}>;

export type GetWorkoutSessionAdjustmentsQuery = {
  __typename?: "Query";
  workout_session_adjustmentsCollection?: {
    __typename?: "workout_session_adjustmentsConnection";
    edges: Array<{
      __typename?: "workout_session_adjustmentsEdge";
      node: {
        __typename?: "workout_session_adjustments";
        id: any;
        session_id: any;
        type: string;
        workout_entry_id?: any | null;
        exercise_id?: any | null;
        from_value: string;
        to_value: string;
        reason: string;
        affected_set_numbers?: Array<number | null> | null;
        affects_future_sets?: boolean | null;
        is_applied?: boolean | null;
        created_at: any;
        exercises?: { __typename?: "exercises"; id: any; name: string } | null;
      };
    }>;
  } | null;
};

export type GetWorkoutSessionChatQueryVariables = Exact<{
  sessionId: Scalars["UUID"]["input"];
}>;

export type GetWorkoutSessionChatQuery = {
  __typename?: "Query";
  workout_session_chatCollection?: {
    __typename?: "workout_session_chatConnection";
    edges: Array<{
      __typename?: "workout_session_chatEdge";
      node: {
        __typename?: "workout_session_chat";
        id: any;
        session_id: any;
        conversation_id: string;
        event_type: string;
        details?: string | null;
        timestamp: any;
        created_at: any;
      };
    }>;
  } | null;
};

export type CreateWorkoutSessionMutationVariables = Exact<{
  userId: Scalars["UUID"]["input"];
  workoutPlanId: Scalars["UUID"]["input"];
  weekNumber: Scalars["Int"]["input"];
  day: Weekday;
  dayName: Scalars["String"]["input"];
  date: Scalars["Date"]["input"];
  totalExercises: Scalars["Int"]["input"];
  totalSets: Scalars["Int"]["input"];
}>;

export type CreateWorkoutSessionMutation = {
  __typename?: "Mutation";
  insertIntoworkout_sessionsCollection?: {
    __typename?: "workout_sessionsInsertResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_sessions";
      id: any;
      user_id: any;
      workout_plan_id: any;
      week_number: number;
      day: Weekday;
      day_name: string;
      date: any;
      status: string;
      started_at: any;
      current_exercise_index?: number | null;
      current_set_index?: number | null;
      completed_exercises?: number | null;
      completed_sets?: number | null;
      total_exercises: number;
      total_sets: number;
      created_at: any;
    }>;
  } | null;
};

export type UpdateWorkoutSessionStatusMutationVariables = Exact<{
  id: Scalars["UUID"]["input"];
  status: Scalars["String"]["input"];
  lastActivityAt?: InputMaybe<Scalars["Datetime"]["input"]>;
}>;

export type UpdateWorkoutSessionStatusMutation = {
  __typename?: "Mutation";
  updateworkout_sessionsCollection: {
    __typename?: "workout_sessionsUpdateResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_sessions";
      id: any;
      status: string;
      updated_at: any;
      last_activity_at?: any | null;
    }>;
  };
};

export type UpdateWorkoutSessionProgressMutationVariables = Exact<{
  id: Scalars["UUID"]["input"];
  currentExerciseIndex?: InputMaybe<Scalars["Int"]["input"]>;
  currentSetIndex?: InputMaybe<Scalars["Int"]["input"]>;
  completedExercises?: InputMaybe<Scalars["Int"]["input"]>;
  completedSets?: InputMaybe<Scalars["Int"]["input"]>;
  totalTimeMs?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPauseTimeMs?: InputMaybe<Scalars["BigInt"]["input"]>;
  lastActivityAt?: InputMaybe<Scalars["Datetime"]["input"]>;
}>;

export type UpdateWorkoutSessionProgressMutation = {
  __typename?: "Mutation";
  updateworkout_sessionsCollection: {
    __typename?: "workout_sessionsUpdateResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_sessions";
      id: any;
      current_exercise_index?: number | null;
      current_set_index?: number | null;
      completed_exercises?: number | null;
      completed_sets?: number | null;
      total_time_ms?: any | null;
      total_pause_time_ms?: any | null;
      last_activity_at?: any | null;
    }>;
  };
};

export type UpdateWorkoutSessionPauseMutationVariables = Exact<{
  id: Scalars["UUID"]["input"];
  pausedAt?: InputMaybe<Scalars["Datetime"]["input"]>;
  resumedAt?: InputMaybe<Scalars["Datetime"]["input"]>;
  lastActivityAt?: InputMaybe<Scalars["Datetime"]["input"]>;
}>;

export type UpdateWorkoutSessionPauseMutation = {
  __typename?: "Mutation";
  updateworkout_sessionsCollection: {
    __typename?: "workout_sessionsUpdateResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_sessions";
      id: any;
      paused_at?: any | null;
      resumed_at?: any | null;
    }>;
  };
};

export type CompleteWorkoutSetMutationVariables = Exact<{
  sessionId: Scalars["UUID"]["input"];
  workoutEntryId: Scalars["UUID"]["input"];
  exerciseId: Scalars["UUID"]["input"];
  setNumber: Scalars["Int"]["input"];
  targetReps?: InputMaybe<Scalars["Int"]["input"]>;
  targetWeight?: InputMaybe<Scalars["BigFloat"]["input"]>;
  targetTime?: InputMaybe<Scalars["Int"]["input"]>;
  actualReps?: InputMaybe<Scalars["Int"]["input"]>;
  actualWeight?: InputMaybe<Scalars["BigFloat"]["input"]>;
  actualTime?: InputMaybe<Scalars["Int"]["input"]>;
  difficulty?: InputMaybe<Scalars["String"]["input"]>;
  userNotes?: InputMaybe<Scalars["String"]["input"]>;
  startedAt?: InputMaybe<Scalars["Datetime"]["input"]>;
  pauseTimeMs?: InputMaybe<Scalars["BigInt"]["input"]>;
}>;

export type CompleteWorkoutSetMutation = {
  __typename?: "Mutation";
  insertIntoworkout_session_setsCollection?: {
    __typename?: "workout_session_setsInsertResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_session_sets";
      id: any;
      session_id: any;
      workout_entry_id: any;
      exercise_id: any;
      set_number: number;
      actual_reps?: number | null;
      actual_weight?: any | null;
      actual_time?: number | null;
      started_at?: any | null;
      pause_time_ms?: any | null;
      difficulty?: string | null;
      completed_at: any;
    }>;
  } | null;
};

export type UpdateSetRestDurationMutationVariables = Exact<{
  sessionId: Scalars["UUID"]["input"];
  workoutEntryId: Scalars["UUID"]["input"];
  setNumber: Scalars["Int"]["input"];
  restStartedAt: Scalars["Datetime"]["input"];
  restCompletedAt: Scalars["Datetime"]["input"];
  restDurationSeconds: Scalars["Int"]["input"];
  restExtended: Scalars["Boolean"]["input"];
}>;

export type UpdateSetRestDurationMutation = {
  __typename?: "Mutation";
  updateworkout_session_setsCollection: {
    __typename?: "workout_session_setsUpdateResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_session_sets";
      id: any;
      session_id: any;
      workout_entry_id: any;
      set_number: number;
      rest_started_at?: any | null;
      rest_completed_at?: any | null;
      rest_duration_seconds?: number | null;
      rest_extended?: boolean | null;
    }>;
  };
};

export type AddWorkoutAdjustmentMutationVariables = Exact<{
  sessionId: Scalars["UUID"]["input"];
  type: Scalars["String"]["input"];
  workoutEntryId?: InputMaybe<Scalars["UUID"]["input"]>;
  exerciseId?: InputMaybe<Scalars["UUID"]["input"]>;
  fromValue: Scalars["String"]["input"];
  toValue: Scalars["String"]["input"];
  reason: Scalars["String"]["input"];
  affectedSetNumbers?: InputMaybe<
    Array<Scalars["Int"]["input"]> | Scalars["Int"]["input"]
  >;
  affectsFutureSets?: InputMaybe<Scalars["Boolean"]["input"]>;
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
}>;

export type AddWorkoutAdjustmentMutation = {
  __typename?: "Mutation";
  insertIntoworkout_session_adjustmentsCollection?: {
    __typename?: "workout_session_adjustmentsInsertResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_session_adjustments";
      id: any;
      session_id: any;
      type: string;
      workout_entry_id?: any | null;
      exercise_id?: any | null;
      from_value: string;
      to_value: string;
      reason: string;
      created_at: any;
    }>;
  } | null;
};

export type TrackWorkoutConversationMutationVariables = Exact<{
  sessionId: Scalars["UUID"]["input"];
  conversationId: Scalars["String"]["input"];
  eventType: Scalars["String"]["input"];
  details?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type TrackWorkoutConversationMutation = {
  __typename?: "Mutation";
  insertIntoworkout_session_chatCollection?: {
    __typename?: "workout_session_chatInsertResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_session_chat";
      id: any;
      session_id: any;
      conversation_id: string;
      event_type: string;
      details?: string | null;
      timestamp: any;
    }>;
  } | null;
};

export type GetUserWorkoutPlanIdsQueryVariables = Exact<{
  userId: Scalars["UUID"]["input"];
}>;

export type GetUserWorkoutPlanIdsQuery = {
  __typename?: "Query";
  workout_plansCollection?: {
    __typename?: "workout_plansConnection";
    edges: Array<{
      __typename?: "workout_plansEdge";
      node: {
        __typename?: "workout_plans";
        id: any;
        status?: Workout_Plan_Status | null;
      };
    }>;
  } | null;
};

export type GetFutureWorkoutEntriesQueryVariables = Exact<{
  workoutPlanIds: Array<Scalars["UUID"]["input"]> | Scalars["UUID"]["input"];
  exerciseId: Scalars["UUID"]["input"];
  today: Scalars["Date"]["input"];
}>;

export type GetFutureWorkoutEntriesQuery = {
  __typename?: "Query";
  workout_entriesCollection?: {
    __typename?: "workout_entriesConnection";
    edges: Array<{
      __typename?: "workout_entriesEdge";
      node: {
        __typename?: "workout_entries";
        id: any;
        workout_plan_id: any;
        exercise_id: any;
        date: any;
        reps: string;
        weight?: string | null;
        time?: string | null;
        sets: number;
        is_adjusted?: boolean | null;
        adjustment_reason?: string | null;
      };
    }>;
  } | null;
};

export type ApplyAdjustmentToFutureWorkoutsMutationVariables = Exact<{
  workoutPlanIds: Array<Scalars["UUID"]["input"]> | Scalars["UUID"]["input"];
  exerciseId: Scalars["UUID"]["input"];
  today: Scalars["Date"]["input"];
  reps?: InputMaybe<Scalars["String"]["input"]>;
  weight?: InputMaybe<Scalars["String"]["input"]>;
  time?: InputMaybe<Scalars["String"]["input"]>;
  adjustmentReason?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type ApplyAdjustmentToFutureWorkoutsMutation = {
  __typename?: "Mutation";
  updateworkout_entriesCollection: {
    __typename?: "workout_entriesUpdateResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_entries";
      id: any;
      exercise_id: any;
      date: any;
      reps: string;
      weight?: string | null;
      time?: string | null;
      is_adjusted?: boolean | null;
      adjustment_reason?: string | null;
    }>;
  };
};

export type CompleteWorkoutSessionMutationVariables = Exact<{
  id: Scalars["UUID"]["input"];
  status: Scalars["String"]["input"];
  completedAt: Scalars["Datetime"]["input"];
  isFullyCompleted: Scalars["Boolean"]["input"];
  finishedEarly: Scalars["Boolean"]["input"];
  completedExercises?: InputMaybe<Scalars["Int"]["input"]>;
  completedSets?: InputMaybe<Scalars["Int"]["input"]>;
  totalTimeMs?: InputMaybe<Scalars["BigInt"]["input"]>;
  totalPauseTimeMs?: InputMaybe<Scalars["BigInt"]["input"]>;
}>;

export type CompleteWorkoutSessionMutation = {
  __typename?: "Mutation";
  updateworkout_sessionsCollection: {
    __typename?: "workout_sessionsUpdateResponse";
    affectedCount: number;
    records: Array<{
      __typename?: "workout_sessions";
      id: any;
      status: string;
      completed_at?: any | null;
      is_fully_completed?: boolean | null;
      finished_early?: boolean | null;
      completed_exercises?: number | null;
      completed_sets?: number | null;
      total_time_ms?: any | null;
      total_pause_time_ms?: any | null;
    }>;
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
              workout_entry_alternativesCollection(orderBy: [{position: AscNullsLast}]) {
                edges {
                  node {
                    id
                    alternative_exercise_id
                    note
                    position
                    exercises {
                      id
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
              workout_entry_alternativesCollection(orderBy: [{position: AscNullsLast}]) {
                edges {
                  node {
                    id
                    alternative_exercise_id
                    note
                    position
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
    }
  }
}
    `;
export const SwapExerciseWithAlternativeDocument = `
    mutation SwapExerciseWithAlternative($workoutEntryId: UUID!, $newExerciseId: UUID!, $alternativeNote: String, $planId: UUID, $weekNumber: Int, $day: weekday) {
  updateworkout_entriesCollection(
    filter: {id: {eq: $workoutEntryId}}
    set: {exercise_id: $newExerciseId, is_adjusted: true, adjustment_reason: "Swapped to alternative exercise"}
  ) {
    records {
      id
      exercise_id
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
    `;
export const UpdateWorkoutEntryDocument = `
    mutation UpdateWorkoutEntry($id: UUID!, $sets: Int, $reps: String, $weight: String, $time: String, $notes: String, $isAdjusted: Boolean, $adjustmentReason: String) {
  updateworkout_entriesCollection(
    filter: {id: {eq: $id}}
    set: {sets: $sets, reps: $reps, weight: $weight, time: $time, notes: $notes, is_adjusted: $isAdjusted, adjustment_reason: $adjustmentReason}
  ) {
    records {
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
      workout_entry_alternativesCollection(orderBy: [{position: AscNullsLast}]) {
        edges {
          node {
            id
            alternative_exercise_id
            note
            position
            exercises {
              id
              name
              slug
              equipment_groups
            }
          }
        }
      }
    }
    affectedCount
  }
}
    `;
export const AddWorkoutEntryDocument = `
    mutation AddWorkoutEntry($workoutPlanId: UUID!, $weekNumber: Int!, $dayName: String!, $day: weekday!, $date: Date!, $exerciseId: UUID!, $sets: Int!, $reps: String!, $streakExerciseId: UUID!, $weight: String, $time: String, $notes: String) {
  insertIntoworkout_entriesCollection(
    objects: [{workout_plan_id: $workoutPlanId, week_number: $weekNumber, day_name: $dayName, day: $day, date: $date, exercise_id: $exerciseId, sets: $sets, reps: $reps, streak_exercise_id: $streakExerciseId, weight: $weight, time: $time, notes: $notes, is_adjusted: false}]
  ) {
    records {
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
      workout_entry_alternativesCollection(orderBy: [{position: AscNullsLast}]) {
        edges {
          node {
            id
            alternative_exercise_id
            note
            position
            exercises {
              id
              name
              slug
              equipment_groups
            }
          }
        }
      }
    }
    affectedCount
  }
}
    `;
export const DeleteWorkoutEntryDocument = `
    mutation DeleteWorkoutEntry($id: UUID!) {
  deleteFromworkout_entriesCollection(filter: {id: {eq: $id}}, atMost: 1) {
    records {
      id
      exercise_id
      sets
      reps
      weight
      time
      notes
      streak_exercise_id
      streak_exercise_notes
    }
    affectedCount
  }
}
    `;
export const GetWorkoutEntryBasicDocument = `
    query GetWorkoutEntryBasic($id: UUID!) {
  workout_entriesCollection(filter: {id: {eq: $id}}) {
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
        workout_plans {
          id
        }
        workout_entry_alternativesCollection(orderBy: [{position: AscNullsLast}]) {
          edges {
            node {
              id
              alternative_exercise_id
              note
              position
            }
          }
        }
      }
    }
  }
}
    `;
export const GetWorkoutEntryDocument = `
    query GetWorkoutEntry($id: UUID!) {
  workout_entriesCollection(filter: {id: {eq: $id}}) {
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
        workout_plans {
          id
        }
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
        workout_entry_alternativesCollection(orderBy: [{position: AscNullsLast}]) {
          edges {
            node {
              id
              alternative_exercise_id
              note
              position
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
export const GetExerciseByIdDocument = `
    query GetExerciseById($id: UUID!) {
  exercisesCollection(filter: {id: {eq: $id}}) {
    edges {
      node {
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
    `;
export const GetAllExercisesDocument = `
    query GetAllExercises($first: Int, $after: Cursor) {
  exercisesCollection(
    first: $first
    after: $after
    orderBy: [{name: AscNullsLast}]
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        name
        slug
        muscle_categories
        equipment_groups
        exercise_location
      }
    }
  }
}
    `;
export const GetWorkoutPresetsDocument = `
    query GetWorkoutPresets {
  workout_presetsCollection(
    filter: {is_active: {eq: true}}
    orderBy: [{sort_order: AscNullsLast}]
  ) {
    edges {
      node {
        id
        name
        description
        day_name
        image_key
        difficulty
        estimated_duration
        sort_order
      }
    }
  }
}
    `;
export const GetWorkoutPresetDocument = `
    query GetWorkoutPreset($id: UUID!) {
  workout_presetsCollection(filter: {id: {eq: $id}}) {
    edges {
      node {
        id
        name
        description
        day_name
        image_key
        difficulty
        estimated_duration
        workout_preset_entriesCollection(orderBy: [{position: AscNullsLast}]) {
          edges {
            node {
              id
              exercise_id
              position
              sets
              reps
              weight
              time
              notes
              streak_exercise_id
              streak_exercise_notes
              exercises {
                id
                name
                slug
                icon_description
                instructions
                video_description
                equipment_text
                equipment_groups
                muscle_categories
              }
              workout_preset_entry_alternativesCollection(orderBy: [{position: AscNullsLast}]) {
                edges {
                  node {
                    id
                    alternative_exercise_id
                    note
                    position
                    exercises {
                      id
                      name
                      slug
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
    }
  }
}
    `;
export const GetWorkoutPresetsWithCountsDocument = `
    query GetWorkoutPresetsWithCounts {
  workout_presetsCollection(
    filter: {is_active: {eq: true}}
    orderBy: [{sort_order: AscNullsLast}]
  ) {
    edges {
      node {
        id
        name
        description
        day_name
        image_key
        difficulty
        estimated_duration
        workout_preset_entriesCollection {
          edges {
            node {
              id
              sets
            }
          }
        }
      }
    }
  }
}
    `;
export const GetWorkoutSessionByDateDocument = `
    query GetWorkoutSessionByDate($workoutPlanId: UUID!, $date: Date!) {
  workout_sessionsCollection(
    filter: {workout_plan_id: {eq: $workoutPlanId}, date: {eq: $date}}
    first: 1
    orderBy: [{created_at: DescNullsLast}]
  ) {
    edges {
      node {
        id
        status
        completed_exercises
        completed_sets
        total_exercises
        total_sets
        total_time_ms
        is_fully_completed
        finished_early
      }
    }
  }
}
    `;
export const GetWorkoutEntriesPresetIdDocument = `
    query GetWorkoutEntriesPresetId($workoutPlanId: UUID!, $date: Date!) {
  workout_entriesCollection(
    filter: {workout_plan_id: {eq: $workoutPlanId}, date: {eq: $date}}
    first: 1
  ) {
    edges {
      node {
        preset_id
      }
    }
  }
}
    `;
export const GetUserWorkoutStatisticsDocument = `
    query GetUserWorkoutStatistics($userId: UUID!) {
  workout_sessionsCollection(
    filter: {user_id: {eq: $userId}, status: {in: ["completed", "finished_early"]}}
    orderBy: [{completed_at: DescNullsLast}]
  ) {
    edges {
      node {
        id
        status
        completed_at
        completed_exercises
        completed_sets
        total_exercises
        total_sets
        total_time_ms
        is_fully_completed
        workout_session_setsCollection {
          edges {
            node {
              id
              actual_reps
              actual_weight
              is_completed
            }
          }
        }
      }
    }
  }
}
    `;
export const GetWorkoutSessionDocument = `
    query GetWorkoutSession($id: UUID!) {
  workout_sessionsCollection(filter: {id: {eq: $id}}) {
    edges {
      node {
        id
        user_id
        workout_plan_id
        week_number
        day
        day_name
        date
        status
        started_at
        completed_at
        paused_at
        resumed_at
        current_exercise_index
        current_set_index
        completed_exercises
        completed_sets
        total_exercises
        total_sets
        total_time_ms
        total_pause_time_ms
        last_activity_at
        is_fully_completed
        finished_early
        created_at
        updated_at
      }
    }
  }
}
    `;
export const GetActiveWorkoutSessionDocument = `
    query GetActiveWorkoutSession($userId: UUID!) {
  workout_sessionsCollection(
    filter: {user_id: {eq: $userId}, status: {in: ["selected", "preparing", "exercising", "paused"]}}
    orderBy: [{started_at: DescNullsLast}]
    first: 1
  ) {
    edges {
      node {
        id
        workout_plan_id
        week_number
        day
        day_name
        date
        status
        started_at
        paused_at
        resumed_at
        current_exercise_index
        current_set_index
        completed_exercises
        completed_sets
        total_exercises
        total_sets
        total_time_ms
        total_pause_time_ms
        last_activity_at
        is_fully_completed
        finished_early
      }
    }
  }
}
    `;
export const GetWorkoutSessionSetsDocument = `
    query GetWorkoutSessionSets($sessionId: UUID!) {
  workout_session_setsCollection(
    filter: {session_id: {eq: $sessionId}}
    orderBy: [{completed_at: AscNullsLast}]
  ) {
    edges {
      node {
        id
        session_id
        workout_entry_id
        exercise_id
        set_number
        target_reps
        target_weight
        target_time
        actual_reps
        actual_weight
        actual_time
        difficulty
        user_notes
        started_at
        completed_at
        is_completed
        skipped
        created_at
        workout_entries {
          preset_id
        }
      }
    }
  }
}
    `;
export const GetWorkoutSessionAdjustmentsDocument = `
    query GetWorkoutSessionAdjustments($sessionId: UUID!) {
  workout_session_adjustmentsCollection(
    filter: {session_id: {eq: $sessionId}}
    orderBy: [{created_at: AscNullsLast}]
  ) {
    edges {
      node {
        id
        session_id
        type
        workout_entry_id
        exercise_id
        from_value
        to_value
        reason
        affected_set_numbers
        affects_future_sets
        is_applied
        created_at
        exercises {
          id
          name
        }
      }
    }
  }
}
    `;
export const GetWorkoutSessionChatDocument = `
    query GetWorkoutSessionChat($sessionId: UUID!) {
  workout_session_chatCollection(
    filter: {session_id: {eq: $sessionId}}
    orderBy: [{timestamp: AscNullsLast}]
  ) {
    edges {
      node {
        id
        session_id
        conversation_id
        event_type
        details
        timestamp
        created_at
      }
    }
  }
}
    `;
export const CreateWorkoutSessionDocument = `
    mutation CreateWorkoutSession($userId: UUID!, $workoutPlanId: UUID!, $weekNumber: Int!, $day: weekday!, $dayName: String!, $date: Date!, $totalExercises: Int!, $totalSets: Int!) {
  insertIntoworkout_sessionsCollection(
    objects: [{user_id: $userId, workout_plan_id: $workoutPlanId, week_number: $weekNumber, day: $day, day_name: $dayName, date: $date, status: "selected", total_exercises: $totalExercises, total_sets: $totalSets}]
  ) {
    records {
      id
      user_id
      workout_plan_id
      week_number
      day
      day_name
      date
      status
      started_at
      current_exercise_index
      current_set_index
      completed_exercises
      completed_sets
      total_exercises
      total_sets
      created_at
    }
    affectedCount
  }
}
    `;
export const UpdateWorkoutSessionStatusDocument = `
    mutation UpdateWorkoutSessionStatus($id: UUID!, $status: String!, $lastActivityAt: Datetime) {
  updateworkout_sessionsCollection(
    filter: {id: {eq: $id}}
    set: {status: $status, last_activity_at: $lastActivityAt}
  ) {
    records {
      id
      status
      updated_at
      last_activity_at
    }
    affectedCount
  }
}
    `;
export const UpdateWorkoutSessionProgressDocument = `
    mutation UpdateWorkoutSessionProgress($id: UUID!, $currentExerciseIndex: Int, $currentSetIndex: Int, $completedExercises: Int, $completedSets: Int, $totalTimeMs: BigInt, $totalPauseTimeMs: BigInt, $lastActivityAt: Datetime) {
  updateworkout_sessionsCollection(
    filter: {id: {eq: $id}}
    set: {current_exercise_index: $currentExerciseIndex, current_set_index: $currentSetIndex, completed_exercises: $completedExercises, completed_sets: $completedSets, total_time_ms: $totalTimeMs, total_pause_time_ms: $totalPauseTimeMs, last_activity_at: $lastActivityAt}
  ) {
    records {
      id
      current_exercise_index
      current_set_index
      completed_exercises
      completed_sets
      total_time_ms
      total_pause_time_ms
      last_activity_at
    }
    affectedCount
  }
}
    `;
export const UpdateWorkoutSessionPauseDocument = `
    mutation UpdateWorkoutSessionPause($id: UUID!, $pausedAt: Datetime, $resumedAt: Datetime, $lastActivityAt: Datetime) {
  updateworkout_sessionsCollection(
    filter: {id: {eq: $id}}
    set: {paused_at: $pausedAt, resumed_at: $resumedAt, last_activity_at: $lastActivityAt}
  ) {
    records {
      id
      paused_at
      resumed_at
    }
    affectedCount
  }
}
    `;
export const CompleteWorkoutSetDocument = `
    mutation CompleteWorkoutSet($sessionId: UUID!, $workoutEntryId: UUID!, $exerciseId: UUID!, $setNumber: Int!, $targetReps: Int, $targetWeight: BigFloat, $targetTime: Int, $actualReps: Int, $actualWeight: BigFloat, $actualTime: Int, $difficulty: String, $userNotes: String, $startedAt: Datetime, $pauseTimeMs: BigInt) {
  insertIntoworkout_session_setsCollection(
    objects: [{session_id: $sessionId, workout_entry_id: $workoutEntryId, exercise_id: $exerciseId, set_number: $setNumber, target_reps: $targetReps, target_weight: $targetWeight, target_time: $targetTime, actual_reps: $actualReps, actual_weight: $actualWeight, actual_time: $actualTime, difficulty: $difficulty, user_notes: $userNotes, started_at: $startedAt, pause_time_ms: $pauseTimeMs, is_completed: true}]
  ) {
    records {
      id
      session_id
      workout_entry_id
      exercise_id
      set_number
      actual_reps
      actual_weight
      actual_time
      started_at
      pause_time_ms
      difficulty
      completed_at
    }
    affectedCount
  }
}
    `;
export const UpdateSetRestDurationDocument = `
    mutation UpdateSetRestDuration($sessionId: UUID!, $workoutEntryId: UUID!, $setNumber: Int!, $restStartedAt: Datetime!, $restCompletedAt: Datetime!, $restDurationSeconds: Int!, $restExtended: Boolean!) {
  updateworkout_session_setsCollection(
    filter: {session_id: {eq: $sessionId}, workout_entry_id: {eq: $workoutEntryId}, set_number: {eq: $setNumber}}
    set: {rest_started_at: $restStartedAt, rest_completed_at: $restCompletedAt, rest_duration_seconds: $restDurationSeconds, rest_extended: $restExtended}
  ) {
    records {
      id
      session_id
      workout_entry_id
      set_number
      rest_started_at
      rest_completed_at
      rest_duration_seconds
      rest_extended
    }
    affectedCount
  }
}
    `;
export const AddWorkoutAdjustmentDocument = `
    mutation AddWorkoutAdjustment($sessionId: UUID!, $type: String!, $workoutEntryId: UUID, $exerciseId: UUID, $fromValue: String!, $toValue: String!, $reason: String!, $affectedSetNumbers: [Int!], $affectsFutureSets: Boolean, $metadata: JSON) {
  insertIntoworkout_session_adjustmentsCollection(
    objects: [{session_id: $sessionId, type: $type, workout_entry_id: $workoutEntryId, exercise_id: $exerciseId, from_value: $fromValue, to_value: $toValue, reason: $reason, affected_set_numbers: $affectedSetNumbers, affects_future_sets: $affectsFutureSets, metadata: $metadata}]
  ) {
    records {
      id
      session_id
      type
      workout_entry_id
      exercise_id
      from_value
      to_value
      reason
      created_at
    }
    affectedCount
  }
}
    `;
export const TrackWorkoutConversationDocument = `
    mutation TrackWorkoutConversation($sessionId: UUID!, $conversationId: String!, $eventType: String!, $details: String) {
  insertIntoworkout_session_chatCollection(
    objects: [{session_id: $sessionId, conversation_id: $conversationId, event_type: $eventType, details: $details}]
  ) {
    records {
      id
      session_id
      conversation_id
      event_type
      details
      timestamp
    }
    affectedCount
  }
}
    `;
export const GetUserWorkoutPlanIdsDocument = `
    query GetUserWorkoutPlanIds($userId: UUID!) {
  workout_plansCollection(filter: {user_id: {eq: $userId}}) {
    edges {
      node {
        id
        status
      }
    }
  }
}
    `;
export const GetFutureWorkoutEntriesDocument = `
    query GetFutureWorkoutEntries($workoutPlanIds: [UUID!]!, $exerciseId: UUID!, $today: Date!) {
  workout_entriesCollection(
    filter: {workout_plan_id: {in: $workoutPlanIds}, exercise_id: {eq: $exerciseId}, date: {gte: $today}}
    orderBy: [{date: AscNullsLast}]
  ) {
    edges {
      node {
        id
        workout_plan_id
        exercise_id
        date
        reps
        weight
        time
        sets
        is_adjusted
        adjustment_reason
      }
    }
  }
}
    `;
export const ApplyAdjustmentToFutureWorkoutsDocument = `
    mutation ApplyAdjustmentToFutureWorkouts($workoutPlanIds: [UUID!]!, $exerciseId: UUID!, $today: Date!, $reps: String, $weight: String, $time: String, $adjustmentReason: String) {
  updateworkout_entriesCollection(
    filter: {workout_plan_id: {in: $workoutPlanIds}, exercise_id: {eq: $exerciseId}, date: {gte: $today}}
    set: {reps: $reps, weight: $weight, time: $time, is_adjusted: true, adjustment_reason: $adjustmentReason}
  ) {
    records {
      id
      exercise_id
      date
      reps
      weight
      time
      is_adjusted
      adjustment_reason
    }
    affectedCount
  }
}
    `;
export const CompleteWorkoutSessionDocument = `
    mutation CompleteWorkoutSession($id: UUID!, $status: String!, $completedAt: Datetime!, $isFullyCompleted: Boolean!, $finishedEarly: Boolean!, $completedExercises: Int, $completedSets: Int, $totalTimeMs: BigInt, $totalPauseTimeMs: BigInt) {
  updateworkout_sessionsCollection(
    filter: {id: {eq: $id}}
    set: {status: $status, completed_at: $completedAt, is_fully_completed: $isFullyCompleted, finished_early: $finishedEarly, completed_exercises: $completedExercises, completed_sets: $completedSets, total_time_ms: $totalTimeMs, total_pause_time_ms: $totalPauseTimeMs}
  ) {
    records {
      id
      status
      completed_at
      is_fully_completed
      finished_early
      completed_exercises
      completed_sets
      total_time_ms
      total_pause_time_ms
    }
    affectedCount
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
    SwapExerciseWithAlternative: build.mutation<
      SwapExerciseWithAlternativeMutation,
      SwapExerciseWithAlternativeMutationVariables
    >({
      query: (variables) => ({
        document: SwapExerciseWithAlternativeDocument,
        variables,
      }),
    }),
    UpdateWorkoutEntry: build.mutation<
      UpdateWorkoutEntryMutation,
      UpdateWorkoutEntryMutationVariables
    >({
      query: (variables) => ({
        document: UpdateWorkoutEntryDocument,
        variables,
      }),
    }),
    AddWorkoutEntry: build.mutation<
      AddWorkoutEntryMutation,
      AddWorkoutEntryMutationVariables
    >({
      query: (variables) => ({ document: AddWorkoutEntryDocument, variables }),
    }),
    DeleteWorkoutEntry: build.mutation<
      DeleteWorkoutEntryMutation,
      DeleteWorkoutEntryMutationVariables
    >({
      query: (variables) => ({
        document: DeleteWorkoutEntryDocument,
        variables,
      }),
    }),
    GetWorkoutEntryBasic: build.query<
      GetWorkoutEntryBasicQuery,
      GetWorkoutEntryBasicQueryVariables
    >({
      query: (variables) => ({
        document: GetWorkoutEntryBasicDocument,
        variables,
      }),
    }),
    GetWorkoutEntry: build.query<
      GetWorkoutEntryQuery,
      GetWorkoutEntryQueryVariables
    >({
      query: (variables) => ({ document: GetWorkoutEntryDocument, variables }),
    }),
    GetExerciseById: build.query<
      GetExerciseByIdQuery,
      GetExerciseByIdQueryVariables
    >({
      query: (variables) => ({ document: GetExerciseByIdDocument, variables }),
    }),
    GetAllExercises: build.query<
      GetAllExercisesQuery,
      GetAllExercisesQueryVariables | void
    >({
      query: (variables) => ({ document: GetAllExercisesDocument, variables }),
    }),
    GetWorkoutPresets: build.query<
      GetWorkoutPresetsQuery,
      GetWorkoutPresetsQueryVariables | void
    >({
      query: (variables) => ({
        document: GetWorkoutPresetsDocument,
        variables,
      }),
    }),
    GetWorkoutPreset: build.query<
      GetWorkoutPresetQuery,
      GetWorkoutPresetQueryVariables
    >({
      query: (variables) => ({ document: GetWorkoutPresetDocument, variables }),
    }),
    GetWorkoutPresetsWithCounts: build.query<
      GetWorkoutPresetsWithCountsQuery,
      GetWorkoutPresetsWithCountsQueryVariables | void
    >({
      query: (variables) => ({
        document: GetWorkoutPresetsWithCountsDocument,
        variables,
      }),
    }),
    GetWorkoutSessionByDate: build.query<
      GetWorkoutSessionByDateQuery,
      GetWorkoutSessionByDateQueryVariables
    >({
      query: (variables) => ({
        document: GetWorkoutSessionByDateDocument,
        variables,
      }),
    }),
    GetWorkoutEntriesPresetId: build.query<
      GetWorkoutEntriesPresetIdQuery,
      GetWorkoutEntriesPresetIdQueryVariables
    >({
      query: (variables) => ({
        document: GetWorkoutEntriesPresetIdDocument,
        variables,
      }),
    }),
    GetUserWorkoutStatistics: build.query<
      GetUserWorkoutStatisticsQuery,
      GetUserWorkoutStatisticsQueryVariables
    >({
      query: (variables) => ({
        document: GetUserWorkoutStatisticsDocument,
        variables,
      }),
    }),
    GetWorkoutSession: build.query<
      GetWorkoutSessionQuery,
      GetWorkoutSessionQueryVariables
    >({
      query: (variables) => ({
        document: GetWorkoutSessionDocument,
        variables,
      }),
    }),
    GetActiveWorkoutSession: build.query<
      GetActiveWorkoutSessionQuery,
      GetActiveWorkoutSessionQueryVariables
    >({
      query: (variables) => ({
        document: GetActiveWorkoutSessionDocument,
        variables,
      }),
    }),
    GetWorkoutSessionSets: build.query<
      GetWorkoutSessionSetsQuery,
      GetWorkoutSessionSetsQueryVariables
    >({
      query: (variables) => ({
        document: GetWorkoutSessionSetsDocument,
        variables,
      }),
    }),
    GetWorkoutSessionAdjustments: build.query<
      GetWorkoutSessionAdjustmentsQuery,
      GetWorkoutSessionAdjustmentsQueryVariables
    >({
      query: (variables) => ({
        document: GetWorkoutSessionAdjustmentsDocument,
        variables,
      }),
    }),
    GetWorkoutSessionChat: build.query<
      GetWorkoutSessionChatQuery,
      GetWorkoutSessionChatQueryVariables
    >({
      query: (variables) => ({
        document: GetWorkoutSessionChatDocument,
        variables,
      }),
    }),
    CreateWorkoutSession: build.mutation<
      CreateWorkoutSessionMutation,
      CreateWorkoutSessionMutationVariables
    >({
      query: (variables) => ({
        document: CreateWorkoutSessionDocument,
        variables,
      }),
    }),
    UpdateWorkoutSessionStatus: build.mutation<
      UpdateWorkoutSessionStatusMutation,
      UpdateWorkoutSessionStatusMutationVariables
    >({
      query: (variables) => ({
        document: UpdateWorkoutSessionStatusDocument,
        variables,
      }),
    }),
    UpdateWorkoutSessionProgress: build.mutation<
      UpdateWorkoutSessionProgressMutation,
      UpdateWorkoutSessionProgressMutationVariables
    >({
      query: (variables) => ({
        document: UpdateWorkoutSessionProgressDocument,
        variables,
      }),
    }),
    UpdateWorkoutSessionPause: build.mutation<
      UpdateWorkoutSessionPauseMutation,
      UpdateWorkoutSessionPauseMutationVariables
    >({
      query: (variables) => ({
        document: UpdateWorkoutSessionPauseDocument,
        variables,
      }),
    }),
    CompleteWorkoutSet: build.mutation<
      CompleteWorkoutSetMutation,
      CompleteWorkoutSetMutationVariables
    >({
      query: (variables) => ({
        document: CompleteWorkoutSetDocument,
        variables,
      }),
    }),
    UpdateSetRestDuration: build.mutation<
      UpdateSetRestDurationMutation,
      UpdateSetRestDurationMutationVariables
    >({
      query: (variables) => ({
        document: UpdateSetRestDurationDocument,
        variables,
      }),
    }),
    AddWorkoutAdjustment: build.mutation<
      AddWorkoutAdjustmentMutation,
      AddWorkoutAdjustmentMutationVariables
    >({
      query: (variables) => ({
        document: AddWorkoutAdjustmentDocument,
        variables,
      }),
    }),
    TrackWorkoutConversation: build.mutation<
      TrackWorkoutConversationMutation,
      TrackWorkoutConversationMutationVariables
    >({
      query: (variables) => ({
        document: TrackWorkoutConversationDocument,
        variables,
      }),
    }),
    GetUserWorkoutPlanIds: build.query<
      GetUserWorkoutPlanIdsQuery,
      GetUserWorkoutPlanIdsQueryVariables
    >({
      query: (variables) => ({
        document: GetUserWorkoutPlanIdsDocument,
        variables,
      }),
    }),
    GetFutureWorkoutEntries: build.query<
      GetFutureWorkoutEntriesQuery,
      GetFutureWorkoutEntriesQueryVariables
    >({
      query: (variables) => ({
        document: GetFutureWorkoutEntriesDocument,
        variables,
      }),
    }),
    ApplyAdjustmentToFutureWorkouts: build.mutation<
      ApplyAdjustmentToFutureWorkoutsMutation,
      ApplyAdjustmentToFutureWorkoutsMutationVariables
    >({
      query: (variables) => ({
        document: ApplyAdjustmentToFutureWorkoutsDocument,
        variables,
      }),
    }),
    CompleteWorkoutSession: build.mutation<
      CompleteWorkoutSessionMutation,
      CompleteWorkoutSessionMutationVariables
    >({
      query: (variables) => ({
        document: CompleteWorkoutSessionDocument,
        variables,
      }),
    }),
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
  useSwapExerciseWithAlternativeMutation,
  useUpdateWorkoutEntryMutation,
  useAddWorkoutEntryMutation,
  useDeleteWorkoutEntryMutation,
  useGetWorkoutEntryBasicQuery,
  useLazyGetWorkoutEntryBasicQuery,
  useGetWorkoutEntryQuery,
  useLazyGetWorkoutEntryQuery,
  useGetExerciseByIdQuery,
  useLazyGetExerciseByIdQuery,
  useGetAllExercisesQuery,
  useLazyGetAllExercisesQuery,
  useGetWorkoutPresetsQuery,
  useLazyGetWorkoutPresetsQuery,
  useGetWorkoutPresetQuery,
  useLazyGetWorkoutPresetQuery,
  useGetWorkoutPresetsWithCountsQuery,
  useLazyGetWorkoutPresetsWithCountsQuery,
  useGetWorkoutSessionByDateQuery,
  useLazyGetWorkoutSessionByDateQuery,
  useGetWorkoutEntriesPresetIdQuery,
  useLazyGetWorkoutEntriesPresetIdQuery,
  useGetUserWorkoutStatisticsQuery,
  useLazyGetUserWorkoutStatisticsQuery,
  useGetWorkoutSessionQuery,
  useLazyGetWorkoutSessionQuery,
  useGetActiveWorkoutSessionQuery,
  useLazyGetActiveWorkoutSessionQuery,
  useGetWorkoutSessionSetsQuery,
  useLazyGetWorkoutSessionSetsQuery,
  useGetWorkoutSessionAdjustmentsQuery,
  useLazyGetWorkoutSessionAdjustmentsQuery,
  useGetWorkoutSessionChatQuery,
  useLazyGetWorkoutSessionChatQuery,
  useCreateWorkoutSessionMutation,
  useUpdateWorkoutSessionStatusMutation,
  useUpdateWorkoutSessionProgressMutation,
  useUpdateWorkoutSessionPauseMutation,
  useCompleteWorkoutSetMutation,
  useUpdateSetRestDurationMutation,
  useAddWorkoutAdjustmentMutation,
  useTrackWorkoutConversationMutation,
  useGetUserWorkoutPlanIdsQuery,
  useLazyGetUserWorkoutPlanIdsQuery,
  useGetFutureWorkoutEntriesQuery,
  useLazyGetFutureWorkoutEntriesQuery,
  useApplyAdjustmentToFutureWorkoutsMutation,
  useCompleteWorkoutSessionMutation,
} = injectedRtkApi;
