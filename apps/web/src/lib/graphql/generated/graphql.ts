/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date and time, represented as an ISO-8601 string */
  DateTime: { input: any; output: any; }
};

export type Adr = {
  __typename?: 'ADR';
  adrFor?: Maybe<Project>;
  adrForConnection: AdrAdrForConnection;
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: AdrDomainConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: AdrStatus;
  supersededBy?: Maybe<Adr>;
  supersededByConnection: AdrSupersededByConnection;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AdrAdrForConnection = {
  __typename?: 'ADRAdrForConnection';
  edges: Array<AdrAdrForRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AdrAdrForConnectionWhere = {
  AND?: InputMaybe<Array<AdrAdrForConnectionWhere>>;
  NOT?: InputMaybe<AdrAdrForConnectionWhere>;
  OR?: InputMaybe<Array<AdrAdrForConnectionWhere>>;
  node?: InputMaybe<ProjectWhere>;
};

export type AdrAdrForCreateFieldInput = {
  node: ProjectCreateInput;
};

export type AdrAdrForDeleteFieldInput = {
  delete?: InputMaybe<ProjectDeleteInput>;
  where?: InputMaybe<AdrAdrForConnectionWhere>;
};

export type AdrAdrForFieldInput = {
  create?: InputMaybe<AdrAdrForCreateFieldInput>;
};

export type AdrAdrForRelationship = {
  __typename?: 'ADRAdrForRelationship';
  cursor: Scalars['String']['output'];
  node: Project;
};

export type AdrAggregate = {
  __typename?: 'ADRAggregate';
  count: Count;
  node: AdrAggregateNode;
};

export type AdrAggregateNode = {
  __typename?: 'ADRAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type AdrCreateInput = {
  adrFor?: InputMaybe<AdrAdrForFieldInput>;
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<AdrDomainFieldInput>;
  name: Scalars['String']['input'];
  status: AdrStatus;
  supersededBy?: InputMaybe<AdrSupersededByFieldInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type AdrDeleteInput = {
  adrFor?: InputMaybe<AdrAdrForDeleteFieldInput>;
  domain?: InputMaybe<AdrDomainDeleteFieldInput>;
  supersededBy?: InputMaybe<AdrSupersededByDeleteFieldInput>;
};

export type AdrDomainConnection = {
  __typename?: 'ADRDomainConnection';
  edges: Array<AdrDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AdrDomainConnectionWhere = {
  AND?: InputMaybe<Array<AdrDomainConnectionWhere>>;
  NOT?: InputMaybe<AdrDomainConnectionWhere>;
  OR?: InputMaybe<Array<AdrDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type AdrDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type AdrDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<AdrDomainConnectionWhere>;
};

export type AdrDomainFieldInput = {
  create?: InputMaybe<AdrDomainCreateFieldInput>;
};

export type AdrDomainRelationship = {
  __typename?: 'ADRDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type AdrEdge = {
  __typename?: 'ADREdge';
  cursor: Scalars['String']['output'];
  node: Adr;
};

/** Fields to sort Adrs by. The order in which sorts are applied is not guaranteed when specifying many fields in one ADRSort object. */
export type AdrSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum AdrStatus {
  Accepted = 'ACCEPTED',
  Deprecated = 'DEPRECATED',
  Proposed = 'PROPOSED',
  Superseded = 'SUPERSEDED'
}

/** ADRStatus filters */
export type AdrStatusEnumScalarFilters = {
  eq?: InputMaybe<AdrStatus>;
  in?: InputMaybe<Array<AdrStatus>>;
};

/** ADRStatus mutations */
export type AdrStatusEnumScalarMutations = {
  set?: InputMaybe<AdrStatus>;
};

export type AdrSupersededByConnection = {
  __typename?: 'ADRSupersededByConnection';
  edges: Array<AdrSupersededByRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AdrSupersededByConnectionWhere = {
  AND?: InputMaybe<Array<AdrSupersededByConnectionWhere>>;
  NOT?: InputMaybe<AdrSupersededByConnectionWhere>;
  OR?: InputMaybe<Array<AdrSupersededByConnectionWhere>>;
  node?: InputMaybe<AdrWhere>;
};

export type AdrSupersededByCreateFieldInput = {
  node: AdrCreateInput;
};

export type AdrSupersededByDeleteFieldInput = {
  delete?: InputMaybe<AdrDeleteInput>;
  where?: InputMaybe<AdrSupersededByConnectionWhere>;
};

export type AdrSupersededByFieldInput = {
  create?: InputMaybe<AdrSupersededByCreateFieldInput>;
};

export type AdrSupersededByRelationship = {
  __typename?: 'ADRSupersededByRelationship';
  cursor: Scalars['String']['output'];
  node: Adr;
};

export type AdrUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<AdrStatusEnumScalarMutations>;
};

export type AdrWhere = {
  AND?: InputMaybe<Array<AdrWhere>>;
  NOT?: InputMaybe<AdrWhere>;
  OR?: InputMaybe<Array<AdrWhere>>;
  adrFor?: InputMaybe<ProjectWhere>;
  adrForConnection?: InputMaybe<AdrAdrForConnectionWhere>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<AdrDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  status?: InputMaybe<AdrStatusEnumScalarFilters>;
  supersededBy?: InputMaybe<AdrWhere>;
  supersededByConnection?: InputMaybe<AdrSupersededByConnectionWhere>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type AdrsConnection = {
  __typename?: 'AdrsConnection';
  aggregate: AdrAggregate;
  edges: Array<AdrEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Assumption = {
  __typename?: 'Assumption';
  assumedBy: Array<Idea>;
  assumedByConnection: AssumptionAssumedByConnection;
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: AssumptionDomainConnection;
  evidence: AssumptionEvidence;
  id: Scalars['ID']['output'];
  importance: AssumptionImportance;
  name: Scalars['String']['output'];
  status: AssumptionStatus;
  testedBy: Array<Experiment>;
  testedByConnection: AssumptionTestedByConnection;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type AssumptionAssumedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<IdeaSort>>;
  where?: InputMaybe<IdeaWhere>;
};


export type AssumptionAssumedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<AssumptionAssumedByConnectionSort>>;
  where?: InputMaybe<AssumptionAssumedByConnectionWhere>;
};


export type AssumptionTestedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ExperimentSort>>;
  where?: InputMaybe<ExperimentWhere>;
};


export type AssumptionTestedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<AssumptionTestedByConnectionSort>>;
  where?: InputMaybe<AssumptionTestedByConnectionWhere>;
};

export type AssumptionAggregate = {
  __typename?: 'AssumptionAggregate';
  count: Count;
  node: AssumptionAggregateNode;
};

export type AssumptionAggregateNode = {
  __typename?: 'AssumptionAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type AssumptionAssumedByAggregateInput = {
  AND?: InputMaybe<Array<AssumptionAssumedByAggregateInput>>;
  NOT?: InputMaybe<AssumptionAssumedByAggregateInput>;
  OR?: InputMaybe<Array<AssumptionAssumedByAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<AssumptionAssumedByNodeAggregationWhereInput>;
};

export type AssumptionAssumedByConnectFieldInput = {
  connect?: InputMaybe<Array<IdeaConnectInput>>;
  where?: InputMaybe<IdeaConnectWhere>;
};

export type AssumptionAssumedByConnection = {
  __typename?: 'AssumptionAssumedByConnection';
  aggregate: AssumptionIdeaAssumedByAggregateSelection;
  edges: Array<AssumptionAssumedByRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AssumptionAssumedByConnectionAggregateInput = {
  AND?: InputMaybe<Array<AssumptionAssumedByConnectionAggregateInput>>;
  NOT?: InputMaybe<AssumptionAssumedByConnectionAggregateInput>;
  OR?: InputMaybe<Array<AssumptionAssumedByConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<AssumptionAssumedByNodeAggregationWhereInput>;
};

export type AssumptionAssumedByConnectionFilters = {
  /** Filter Assumptions by aggregating results on related AssumptionAssumedByConnections */
  aggregate?: InputMaybe<AssumptionAssumedByConnectionAggregateInput>;
  /** Return Assumptions where all of the related AssumptionAssumedByConnections match this filter */
  all?: InputMaybe<AssumptionAssumedByConnectionWhere>;
  /** Return Assumptions where none of the related AssumptionAssumedByConnections match this filter */
  none?: InputMaybe<AssumptionAssumedByConnectionWhere>;
  /** Return Assumptions where one of the related AssumptionAssumedByConnections match this filter */
  single?: InputMaybe<AssumptionAssumedByConnectionWhere>;
  /** Return Assumptions where some of the related AssumptionAssumedByConnections match this filter */
  some?: InputMaybe<AssumptionAssumedByConnectionWhere>;
};

export type AssumptionAssumedByConnectionSort = {
  node?: InputMaybe<IdeaSort>;
};

export type AssumptionAssumedByConnectionWhere = {
  AND?: InputMaybe<Array<AssumptionAssumedByConnectionWhere>>;
  NOT?: InputMaybe<AssumptionAssumedByConnectionWhere>;
  OR?: InputMaybe<Array<AssumptionAssumedByConnectionWhere>>;
  node?: InputMaybe<IdeaWhere>;
};

export type AssumptionAssumedByCreateFieldInput = {
  node: IdeaCreateInput;
};

export type AssumptionAssumedByDeleteFieldInput = {
  delete?: InputMaybe<IdeaDeleteInput>;
  where?: InputMaybe<AssumptionAssumedByConnectionWhere>;
};

export type AssumptionAssumedByDisconnectFieldInput = {
  disconnect?: InputMaybe<IdeaDisconnectInput>;
  where?: InputMaybe<AssumptionAssumedByConnectionWhere>;
};

export type AssumptionAssumedByFieldInput = {
  connect?: InputMaybe<Array<AssumptionAssumedByConnectFieldInput>>;
  create?: InputMaybe<Array<AssumptionAssumedByCreateFieldInput>>;
};

export type AssumptionAssumedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<AssumptionAssumedByNodeAggregationWhereInput>>;
  NOT?: InputMaybe<AssumptionAssumedByNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<AssumptionAssumedByNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type AssumptionAssumedByRelationship = {
  __typename?: 'AssumptionAssumedByRelationship';
  cursor: Scalars['String']['output'];
  node: Idea;
};

export type AssumptionAssumedByUpdateConnectionInput = {
  node?: InputMaybe<IdeaUpdateInput>;
  where?: InputMaybe<AssumptionAssumedByConnectionWhere>;
};

export type AssumptionAssumedByUpdateFieldInput = {
  connect?: InputMaybe<Array<AssumptionAssumedByConnectFieldInput>>;
  create?: InputMaybe<Array<AssumptionAssumedByCreateFieldInput>>;
  delete?: InputMaybe<Array<AssumptionAssumedByDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<AssumptionAssumedByDisconnectFieldInput>>;
  update?: InputMaybe<AssumptionAssumedByUpdateConnectionInput>;
};

export type AssumptionConnectInput = {
  assumedBy?: InputMaybe<Array<AssumptionAssumedByConnectFieldInput>>;
  testedBy?: InputMaybe<Array<AssumptionTestedByConnectFieldInput>>;
};

export type AssumptionConnectWhere = {
  node: AssumptionWhere;
};

export type AssumptionCreateInput = {
  assumedBy?: InputMaybe<AssumptionAssumedByFieldInput>;
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<AssumptionDomainFieldInput>;
  evidence: AssumptionEvidence;
  importance: AssumptionImportance;
  name: Scalars['String']['input'];
  status: AssumptionStatus;
  testedBy?: InputMaybe<AssumptionTestedByFieldInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type AssumptionDeleteInput = {
  assumedBy?: InputMaybe<Array<AssumptionAssumedByDeleteFieldInput>>;
  domain?: InputMaybe<AssumptionDomainDeleteFieldInput>;
  testedBy?: InputMaybe<Array<AssumptionTestedByDeleteFieldInput>>;
};

export type AssumptionDisconnectInput = {
  assumedBy?: InputMaybe<Array<AssumptionAssumedByDisconnectFieldInput>>;
  testedBy?: InputMaybe<Array<AssumptionTestedByDisconnectFieldInput>>;
};

export type AssumptionDomainConnection = {
  __typename?: 'AssumptionDomainConnection';
  edges: Array<AssumptionDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AssumptionDomainConnectionWhere = {
  AND?: InputMaybe<Array<AssumptionDomainConnectionWhere>>;
  NOT?: InputMaybe<AssumptionDomainConnectionWhere>;
  OR?: InputMaybe<Array<AssumptionDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type AssumptionDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type AssumptionDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<AssumptionDomainConnectionWhere>;
};

export type AssumptionDomainFieldInput = {
  create?: InputMaybe<AssumptionDomainCreateFieldInput>;
};

export type AssumptionDomainRelationship = {
  __typename?: 'AssumptionDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type AssumptionEdge = {
  __typename?: 'AssumptionEdge';
  cursor: Scalars['String']['output'];
  node: Assumption;
};

export enum AssumptionEvidence {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

/** AssumptionEvidence filters */
export type AssumptionEvidenceEnumScalarFilters = {
  eq?: InputMaybe<AssumptionEvidence>;
  in?: InputMaybe<Array<AssumptionEvidence>>;
};

/** AssumptionEvidence mutations */
export type AssumptionEvidenceEnumScalarMutations = {
  set?: InputMaybe<AssumptionEvidence>;
};

export type AssumptionExperimentTestedByAggregateSelection = {
  __typename?: 'AssumptionExperimentTestedByAggregateSelection';
  count: CountConnection;
  node?: Maybe<AssumptionExperimentTestedByNodeAggregateSelection>;
};

export type AssumptionExperimentTestedByNodeAggregateSelection = {
  __typename?: 'AssumptionExperimentTestedByNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  duration: StringAggregateSelection;
  learnings: StringAggregateSelection;
  name: StringAggregateSelection;
  successCriteria: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type AssumptionIdeaAssumedByAggregateSelection = {
  __typename?: 'AssumptionIdeaAssumedByAggregateSelection';
  count: CountConnection;
  node?: Maybe<AssumptionIdeaAssumedByNodeAggregateSelection>;
};

export type AssumptionIdeaAssumedByNodeAggregateSelection = {
  __typename?: 'AssumptionIdeaAssumedByNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export enum AssumptionImportance {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

/** AssumptionImportance filters */
export type AssumptionImportanceEnumScalarFilters = {
  eq?: InputMaybe<AssumptionImportance>;
  in?: InputMaybe<Array<AssumptionImportance>>;
};

/** AssumptionImportance mutations */
export type AssumptionImportanceEnumScalarMutations = {
  set?: InputMaybe<AssumptionImportance>;
};

export type AssumptionRelationshipFilters = {
  /** Filter type where all of the related Assumptions match this filter */
  all?: InputMaybe<AssumptionWhere>;
  /** Filter type where none of the related Assumptions match this filter */
  none?: InputMaybe<AssumptionWhere>;
  /** Filter type where one of the related Assumptions match this filter */
  single?: InputMaybe<AssumptionWhere>;
  /** Filter type where some of the related Assumptions match this filter */
  some?: InputMaybe<AssumptionWhere>;
};

/** Fields to sort Assumptions by. The order in which sorts are applied is not guaranteed when specifying many fields in one AssumptionSort object. */
export type AssumptionSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  evidence?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  importance?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum AssumptionStatus {
  Invalidated = 'INVALIDATED',
  Untested = 'UNTESTED',
  Validated = 'VALIDATED'
}

/** AssumptionStatus filters */
export type AssumptionStatusEnumScalarFilters = {
  eq?: InputMaybe<AssumptionStatus>;
  in?: InputMaybe<Array<AssumptionStatus>>;
};

/** AssumptionStatus mutations */
export type AssumptionStatusEnumScalarMutations = {
  set?: InputMaybe<AssumptionStatus>;
};

export type AssumptionTestedByAggregateInput = {
  AND?: InputMaybe<Array<AssumptionTestedByAggregateInput>>;
  NOT?: InputMaybe<AssumptionTestedByAggregateInput>;
  OR?: InputMaybe<Array<AssumptionTestedByAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<AssumptionTestedByNodeAggregationWhereInput>;
};

export type AssumptionTestedByConnectFieldInput = {
  connect?: InputMaybe<Array<ExperimentConnectInput>>;
  where?: InputMaybe<ExperimentConnectWhere>;
};

export type AssumptionTestedByConnection = {
  __typename?: 'AssumptionTestedByConnection';
  aggregate: AssumptionExperimentTestedByAggregateSelection;
  edges: Array<AssumptionTestedByRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AssumptionTestedByConnectionAggregateInput = {
  AND?: InputMaybe<Array<AssumptionTestedByConnectionAggregateInput>>;
  NOT?: InputMaybe<AssumptionTestedByConnectionAggregateInput>;
  OR?: InputMaybe<Array<AssumptionTestedByConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<AssumptionTestedByNodeAggregationWhereInput>;
};

export type AssumptionTestedByConnectionFilters = {
  /** Filter Assumptions by aggregating results on related AssumptionTestedByConnections */
  aggregate?: InputMaybe<AssumptionTestedByConnectionAggregateInput>;
  /** Return Assumptions where all of the related AssumptionTestedByConnections match this filter */
  all?: InputMaybe<AssumptionTestedByConnectionWhere>;
  /** Return Assumptions where none of the related AssumptionTestedByConnections match this filter */
  none?: InputMaybe<AssumptionTestedByConnectionWhere>;
  /** Return Assumptions where one of the related AssumptionTestedByConnections match this filter */
  single?: InputMaybe<AssumptionTestedByConnectionWhere>;
  /** Return Assumptions where some of the related AssumptionTestedByConnections match this filter */
  some?: InputMaybe<AssumptionTestedByConnectionWhere>;
};

export type AssumptionTestedByConnectionSort = {
  node?: InputMaybe<ExperimentSort>;
};

export type AssumptionTestedByConnectionWhere = {
  AND?: InputMaybe<Array<AssumptionTestedByConnectionWhere>>;
  NOT?: InputMaybe<AssumptionTestedByConnectionWhere>;
  OR?: InputMaybe<Array<AssumptionTestedByConnectionWhere>>;
  node?: InputMaybe<ExperimentWhere>;
};

export type AssumptionTestedByCreateFieldInput = {
  node: ExperimentCreateInput;
};

export type AssumptionTestedByDeleteFieldInput = {
  delete?: InputMaybe<ExperimentDeleteInput>;
  where?: InputMaybe<AssumptionTestedByConnectionWhere>;
};

export type AssumptionTestedByDisconnectFieldInput = {
  disconnect?: InputMaybe<ExperimentDisconnectInput>;
  where?: InputMaybe<AssumptionTestedByConnectionWhere>;
};

export type AssumptionTestedByFieldInput = {
  connect?: InputMaybe<Array<AssumptionTestedByConnectFieldInput>>;
  create?: InputMaybe<Array<AssumptionTestedByCreateFieldInput>>;
};

export type AssumptionTestedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<AssumptionTestedByNodeAggregationWhereInput>>;
  NOT?: InputMaybe<AssumptionTestedByNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<AssumptionTestedByNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  duration?: InputMaybe<StringScalarAggregationFilters>;
  learnings?: InputMaybe<StringScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  successCriteria?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type AssumptionTestedByRelationship = {
  __typename?: 'AssumptionTestedByRelationship';
  cursor: Scalars['String']['output'];
  node: Experiment;
};

export type AssumptionTestedByUpdateConnectionInput = {
  node?: InputMaybe<ExperimentUpdateInput>;
  where?: InputMaybe<AssumptionTestedByConnectionWhere>;
};

export type AssumptionTestedByUpdateFieldInput = {
  connect?: InputMaybe<Array<AssumptionTestedByConnectFieldInput>>;
  create?: InputMaybe<Array<AssumptionTestedByCreateFieldInput>>;
  delete?: InputMaybe<Array<AssumptionTestedByDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<AssumptionTestedByDisconnectFieldInput>>;
  update?: InputMaybe<AssumptionTestedByUpdateConnectionInput>;
};

export type AssumptionUpdateInput = {
  assumedBy?: InputMaybe<Array<AssumptionAssumedByUpdateFieldInput>>;
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  evidence?: InputMaybe<AssumptionEvidenceEnumScalarMutations>;
  importance?: InputMaybe<AssumptionImportanceEnumScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<AssumptionStatusEnumScalarMutations>;
  testedBy?: InputMaybe<Array<AssumptionTestedByUpdateFieldInput>>;
};

export type AssumptionWhere = {
  AND?: InputMaybe<Array<AssumptionWhere>>;
  NOT?: InputMaybe<AssumptionWhere>;
  OR?: InputMaybe<Array<AssumptionWhere>>;
  assumedBy?: InputMaybe<IdeaRelationshipFilters>;
  assumedByConnection?: InputMaybe<AssumptionAssumedByConnectionFilters>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<AssumptionDomainConnectionWhere>;
  evidence?: InputMaybe<AssumptionEvidenceEnumScalarFilters>;
  id?: InputMaybe<IdScalarFilters>;
  importance?: InputMaybe<AssumptionImportanceEnumScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  status?: InputMaybe<AssumptionStatusEnumScalarFilters>;
  testedBy?: InputMaybe<ExperimentRelationshipFilters>;
  testedByConnection?: InputMaybe<AssumptionTestedByConnectionFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type AssumptionWithExperiments = {
  __typename?: 'AssumptionWithExperiments';
  evidence: AssumptionEvidence;
  experiments: Array<ExperimentSummary>;
  id: Scalars['ID']['output'];
  importance: AssumptionImportance;
  name: Scalars['String']['output'];
  status: AssumptionStatus;
};

export type AssumptionsConnection = {
  __typename?: 'AssumptionsConnection';
  aggregate: AssumptionAggregate;
  edges: Array<AssumptionEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Bug = {
  __typename?: 'Bug';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: BugDomainConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parent?: Maybe<Epic>;
  parentConnection: BugParentConnection;
  severity: BugSeverity;
  status: BugStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type BugAggregate = {
  __typename?: 'BugAggregate';
  count: Count;
  node: BugAggregateNode;
};

export type BugAggregateNode = {
  __typename?: 'BugAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type BugCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<BugDomainFieldInput>;
  name: Scalars['String']['input'];
  parent?: InputMaybe<BugParentFieldInput>;
  severity: BugSeverity;
  status: BugStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type BugDeleteInput = {
  domain?: InputMaybe<BugDomainDeleteFieldInput>;
  parent?: InputMaybe<BugParentDeleteFieldInput>;
};

export type BugDomainConnection = {
  __typename?: 'BugDomainConnection';
  edges: Array<BugDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BugDomainConnectionWhere = {
  AND?: InputMaybe<Array<BugDomainConnectionWhere>>;
  NOT?: InputMaybe<BugDomainConnectionWhere>;
  OR?: InputMaybe<Array<BugDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type BugDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type BugDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<BugDomainConnectionWhere>;
};

export type BugDomainFieldInput = {
  create?: InputMaybe<BugDomainCreateFieldInput>;
};

export type BugDomainRelationship = {
  __typename?: 'BugDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type BugEdge = {
  __typename?: 'BugEdge';
  cursor: Scalars['String']['output'];
  node: Bug;
};

export type BugParentConnection = {
  __typename?: 'BugParentConnection';
  edges: Array<BugParentRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BugParentConnectionWhere = {
  AND?: InputMaybe<Array<BugParentConnectionWhere>>;
  NOT?: InputMaybe<BugParentConnectionWhere>;
  OR?: InputMaybe<Array<BugParentConnectionWhere>>;
  node?: InputMaybe<EpicWhere>;
};

export type BugParentCreateFieldInput = {
  node: EpicCreateInput;
};

export type BugParentDeleteFieldInput = {
  delete?: InputMaybe<EpicDeleteInput>;
  where?: InputMaybe<BugParentConnectionWhere>;
};

export type BugParentFieldInput = {
  create?: InputMaybe<BugParentCreateFieldInput>;
};

export type BugParentRelationship = {
  __typename?: 'BugParentRelationship';
  cursor: Scalars['String']['output'];
  node: Epic;
};

export enum BugSeverity {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

/** BugSeverity filters */
export type BugSeverityEnumScalarFilters = {
  eq?: InputMaybe<BugSeverity>;
  in?: InputMaybe<Array<BugSeverity>>;
};

/** BugSeverity mutations */
export type BugSeverityEnumScalarMutations = {
  set?: InputMaybe<BugSeverity>;
};

/** Fields to sort Bugs by. The order in which sorts are applied is not guaranteed when specifying many fields in one BugSort object. */
export type BugSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  severity?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum BugStatus {
  FixInProgress = 'FIX_IN_PROGRESS',
  Investigating = 'INVESTIGATING',
  Open = 'OPEN',
  Resolved = 'RESOLVED'
}

/** BugStatus filters */
export type BugStatusEnumScalarFilters = {
  eq?: InputMaybe<BugStatus>;
  in?: InputMaybe<Array<BugStatus>>;
};

/** BugStatus mutations */
export type BugStatusEnumScalarMutations = {
  set?: InputMaybe<BugStatus>;
};

export type BugUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  severity?: InputMaybe<BugSeverityEnumScalarMutations>;
  status?: InputMaybe<BugStatusEnumScalarMutations>;
};

export type BugWhere = {
  AND?: InputMaybe<Array<BugWhere>>;
  NOT?: InputMaybe<BugWhere>;
  OR?: InputMaybe<Array<BugWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<BugDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  parent?: InputMaybe<EpicWhere>;
  parentConnection?: InputMaybe<BugParentConnectionWhere>;
  severity?: InputMaybe<BugSeverityEnumScalarFilters>;
  status?: InputMaybe<BugStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type BugsConnection = {
  __typename?: 'BugsConnection';
  aggregate: BugAggregate;
  edges: Array<BugEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Chore = {
  __typename?: 'Chore';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: ChoreDomainConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parent?: Maybe<Epic>;
  parentConnection: ChoreParentConnection;
  status: ChoreStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ChoreAggregate = {
  __typename?: 'ChoreAggregate';
  count: Count;
  node: ChoreAggregateNode;
};

export type ChoreAggregateNode = {
  __typename?: 'ChoreAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type ChoreCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<ChoreDomainFieldInput>;
  name: Scalars['String']['input'];
  parent?: InputMaybe<ChoreParentFieldInput>;
  status: ChoreStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type ChoreDeleteInput = {
  domain?: InputMaybe<ChoreDomainDeleteFieldInput>;
  parent?: InputMaybe<ChoreParentDeleteFieldInput>;
};

export type ChoreDomainConnection = {
  __typename?: 'ChoreDomainConnection';
  edges: Array<ChoreDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ChoreDomainConnectionWhere = {
  AND?: InputMaybe<Array<ChoreDomainConnectionWhere>>;
  NOT?: InputMaybe<ChoreDomainConnectionWhere>;
  OR?: InputMaybe<Array<ChoreDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type ChoreDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type ChoreDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<ChoreDomainConnectionWhere>;
};

export type ChoreDomainFieldInput = {
  create?: InputMaybe<ChoreDomainCreateFieldInput>;
};

export type ChoreDomainRelationship = {
  __typename?: 'ChoreDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type ChoreEdge = {
  __typename?: 'ChoreEdge';
  cursor: Scalars['String']['output'];
  node: Chore;
};

export type ChoreParentConnection = {
  __typename?: 'ChoreParentConnection';
  edges: Array<ChoreParentRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ChoreParentConnectionWhere = {
  AND?: InputMaybe<Array<ChoreParentConnectionWhere>>;
  NOT?: InputMaybe<ChoreParentConnectionWhere>;
  OR?: InputMaybe<Array<ChoreParentConnectionWhere>>;
  node?: InputMaybe<EpicWhere>;
};

export type ChoreParentCreateFieldInput = {
  node: EpicCreateInput;
};

export type ChoreParentDeleteFieldInput = {
  delete?: InputMaybe<EpicDeleteInput>;
  where?: InputMaybe<ChoreParentConnectionWhere>;
};

export type ChoreParentFieldInput = {
  create?: InputMaybe<ChoreParentCreateFieldInput>;
};

export type ChoreParentRelationship = {
  __typename?: 'ChoreParentRelationship';
  cursor: Scalars['String']['output'];
  node: Epic;
};

/** Fields to sort Chores by. The order in which sorts are applied is not guaranteed when specifying many fields in one ChoreSort object. */
export type ChoreSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum ChoreStatus {
  Done = 'DONE',
  InProgress = 'IN_PROGRESS',
  Todo = 'TODO'
}

/** ChoreStatus filters */
export type ChoreStatusEnumScalarFilters = {
  eq?: InputMaybe<ChoreStatus>;
  in?: InputMaybe<Array<ChoreStatus>>;
};

/** ChoreStatus mutations */
export type ChoreStatusEnumScalarMutations = {
  set?: InputMaybe<ChoreStatus>;
};

export type ChoreUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<ChoreStatusEnumScalarMutations>;
};

export type ChoreWhere = {
  AND?: InputMaybe<Array<ChoreWhere>>;
  NOT?: InputMaybe<ChoreWhere>;
  OR?: InputMaybe<Array<ChoreWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<ChoreDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  parent?: InputMaybe<EpicWhere>;
  parentConnection?: InputMaybe<ChoreParentConnectionWhere>;
  status?: InputMaybe<ChoreStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type ChoresConnection = {
  __typename?: 'ChoresConnection';
  aggregate: ChoreAggregate;
  edges: Array<ChoreEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ConnectionAggregationCountFilterInput = {
  edges?: InputMaybe<IntScalarFilters>;
  nodes?: InputMaybe<IntScalarFilters>;
};

export type Count = {
  __typename?: 'Count';
  nodes: Scalars['Int']['output'];
};

export type CountConnection = {
  __typename?: 'CountConnection';
  edges: Scalars['Int']['output'];
  nodes: Scalars['Int']['output'];
};

export type CreateAdrsMutationResponse = {
  __typename?: 'CreateAdrsMutationResponse';
  adrs: Array<Adr>;
  info: CreateInfo;
};

export type CreateAssumptionsMutationResponse = {
  __typename?: 'CreateAssumptionsMutationResponse';
  assumptions: Array<Assumption>;
  info: CreateInfo;
};

export type CreateBugsMutationResponse = {
  __typename?: 'CreateBugsMutationResponse';
  bugs: Array<Bug>;
  info: CreateInfo;
};

export type CreateChoresMutationResponse = {
  __typename?: 'CreateChoresMutationResponse';
  chores: Array<Chore>;
  info: CreateInfo;
};

export type CreateDevMilestonesMutationResponse = {
  __typename?: 'CreateDevMilestonesMutationResponse';
  devMilestones: Array<DevMilestone>;
  info: CreateInfo;
};

export type CreateDevWorkstreamsMutationResponse = {
  __typename?: 'CreateDevWorkstreamsMutationResponse';
  devWorkstreams: Array<DevWorkstream>;
  info: CreateInfo;
};

export type CreateDomainsMutationResponse = {
  __typename?: 'CreateDomainsMutationResponse';
  domains: Array<Domain>;
  info: CreateInfo;
};

export type CreateEnhancementsMutationResponse = {
  __typename?: 'CreateEnhancementsMutationResponse';
  enhancements: Array<Enhancement>;
  info: CreateInfo;
};

export type CreateEpicsMutationResponse = {
  __typename?: 'CreateEpicsMutationResponse';
  epics: Array<Epic>;
  info: CreateInfo;
};

export type CreateExperimentsMutationResponse = {
  __typename?: 'CreateExperimentsMutationResponse';
  experiments: Array<Experiment>;
  info: CreateInfo;
};

export type CreateIdeasMutationResponse = {
  __typename?: 'CreateIdeasMutationResponse';
  ideas: Array<Idea>;
  info: CreateInfo;
};

/** Information about the number of nodes and relationships created during a create mutation */
export type CreateInfo = {
  __typename?: 'CreateInfo';
  nodesCreated: Scalars['Int']['output'];
  relationshipsCreated: Scalars['Int']['output'];
};

export type CreateInitiativesMutationResponse = {
  __typename?: 'CreateInitiativesMutationResponse';
  info: CreateInfo;
  initiatives: Array<Initiative>;
};

export type CreateObjectivesMutationResponse = {
  __typename?: 'CreateObjectivesMutationResponse';
  info: CreateInfo;
  objectives: Array<Objective>;
};

export type CreateOpportunitiesMutationResponse = {
  __typename?: 'CreateOpportunitiesMutationResponse';
  info: CreateInfo;
  opportunities: Array<Opportunity>;
};

export type CreateOrganizationsMutationResponse = {
  __typename?: 'CreateOrganizationsMutationResponse';
  info: CreateInfo;
  organizations: Array<Organization>;
};

export type CreateProjectsMutationResponse = {
  __typename?: 'CreateProjectsMutationResponse';
  info: CreateInfo;
  projects: Array<Project>;
};

export type CreateSpecsMutationResponse = {
  __typename?: 'CreateSpecsMutationResponse';
  info: CreateInfo;
  specs: Array<Spec>;
};

export type CreateSpikesMutationResponse = {
  __typename?: 'CreateSpikesMutationResponse';
  info: CreateInfo;
  spikes: Array<Spike>;
};

export type CreateStoriesMutationResponse = {
  __typename?: 'CreateStoriesMutationResponse';
  info: CreateInfo;
  stories: Array<Story>;
};

export type CreateTasksMutationResponse = {
  __typename?: 'CreateTasksMutationResponse';
  info: CreateInfo;
  tasks: Array<Task>;
};

export type CreateUsersMutationResponse = {
  __typename?: 'CreateUsersMutationResponse';
  info: CreateInfo;
  users: Array<User>;
};

export type DateTimeAggregateSelection = {
  __typename?: 'DateTimeAggregateSelection';
  max?: Maybe<Scalars['DateTime']['output']>;
  min?: Maybe<Scalars['DateTime']['output']>;
};

/** Filters for an aggregation of an DateTime input field */
export type DateTimeScalarAggregationFilters = {
  max?: InputMaybe<DateTimeScalarFilters>;
  min?: InputMaybe<DateTimeScalarFilters>;
};

/** DateTime filters */
export type DateTimeScalarFilters = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
};

/** DateTime mutations */
export type DateTimeScalarMutations = {
  set?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Information about the number of nodes and relationships deleted during a delete mutation */
export type DeleteInfo = {
  __typename?: 'DeleteInfo';
  nodesDeleted: Scalars['Int']['output'];
  relationshipsDeleted: Scalars['Int']['output'];
};

export type DevMilestone = {
  __typename?: 'DevMilestone';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  demoCriteria?: Maybe<Scalars['String']['output']>;
  domain?: Maybe<Domain>;
  domainConnection: DevMilestoneDomainConnection;
  id: Scalars['ID']['output'];
  milestoneType?: Maybe<DevMilestoneType>;
  name: Scalars['String']['output'];
  project?: Maybe<Project>;
  projectConnection: DevMilestoneProjectConnection;
  status: DevMilestoneStatus;
  targetDate?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workstreamDeliverables: Array<Scalars['String']['output']>;
};

export type DevMilestoneAggregate = {
  __typename?: 'DevMilestoneAggregate';
  count: Count;
  node: DevMilestoneAggregateNode;
};

export type DevMilestoneAggregateNode = {
  __typename?: 'DevMilestoneAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  demoCriteria: StringAggregateSelection;
  name: StringAggregateSelection;
  targetDate: DateTimeAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type DevMilestoneConnectWhere = {
  node: DevMilestoneWhere;
};

export type DevMilestoneCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  demoCriteria?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<DevMilestoneDomainFieldInput>;
  milestoneType?: InputMaybe<DevMilestoneType>;
  name: Scalars['String']['input'];
  project?: InputMaybe<DevMilestoneProjectFieldInput>;
  status: DevMilestoneStatus;
  targetDate?: InputMaybe<Scalars['DateTime']['input']>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  workstreamDeliverables: Array<Scalars['String']['input']>;
};

export type DevMilestoneDeleteInput = {
  domain?: InputMaybe<DevMilestoneDomainDeleteFieldInput>;
  project?: InputMaybe<DevMilestoneProjectDeleteFieldInput>;
};

export type DevMilestoneDomainConnection = {
  __typename?: 'DevMilestoneDomainConnection';
  edges: Array<DevMilestoneDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DevMilestoneDomainConnectionWhere = {
  AND?: InputMaybe<Array<DevMilestoneDomainConnectionWhere>>;
  NOT?: InputMaybe<DevMilestoneDomainConnectionWhere>;
  OR?: InputMaybe<Array<DevMilestoneDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type DevMilestoneDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type DevMilestoneDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<DevMilestoneDomainConnectionWhere>;
};

export type DevMilestoneDomainFieldInput = {
  create?: InputMaybe<DevMilestoneDomainCreateFieldInput>;
};

export type DevMilestoneDomainRelationship = {
  __typename?: 'DevMilestoneDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type DevMilestoneEdge = {
  __typename?: 'DevMilestoneEdge';
  cursor: Scalars['String']['output'];
  node: DevMilestone;
};

export type DevMilestoneProjectConnection = {
  __typename?: 'DevMilestoneProjectConnection';
  edges: Array<DevMilestoneProjectRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DevMilestoneProjectConnectionWhere = {
  AND?: InputMaybe<Array<DevMilestoneProjectConnectionWhere>>;
  NOT?: InputMaybe<DevMilestoneProjectConnectionWhere>;
  OR?: InputMaybe<Array<DevMilestoneProjectConnectionWhere>>;
  node?: InputMaybe<ProjectWhere>;
};

export type DevMilestoneProjectCreateFieldInput = {
  node: ProjectCreateInput;
};

export type DevMilestoneProjectDeleteFieldInput = {
  delete?: InputMaybe<ProjectDeleteInput>;
  where?: InputMaybe<DevMilestoneProjectConnectionWhere>;
};

export type DevMilestoneProjectFieldInput = {
  create?: InputMaybe<DevMilestoneProjectCreateFieldInput>;
};

export type DevMilestoneProjectRelationship = {
  __typename?: 'DevMilestoneProjectRelationship';
  cursor: Scalars['String']['output'];
  node: Project;
};

export type DevMilestoneRelationshipFilters = {
  /** Filter type where all of the related DevMilestones match this filter */
  all?: InputMaybe<DevMilestoneWhere>;
  /** Filter type where none of the related DevMilestones match this filter */
  none?: InputMaybe<DevMilestoneWhere>;
  /** Filter type where one of the related DevMilestones match this filter */
  single?: InputMaybe<DevMilestoneWhere>;
  /** Filter type where some of the related DevMilestones match this filter */
  some?: InputMaybe<DevMilestoneWhere>;
};

/** Fields to sort DevMilestones by. The order in which sorts are applied is not guaranteed when specifying many fields in one DevMilestoneSort object. */
export type DevMilestoneSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  demoCriteria?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  milestoneType?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  targetDate?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum DevMilestoneStatus {
  Complete = 'COMPLETE',
  InProgress = 'IN_PROGRESS',
  Planned = 'PLANNED'
}

/** DevMilestoneStatus filters */
export type DevMilestoneStatusEnumScalarFilters = {
  eq?: InputMaybe<DevMilestoneStatus>;
  in?: InputMaybe<Array<DevMilestoneStatus>>;
};

/** DevMilestoneStatus mutations */
export type DevMilestoneStatusEnumScalarMutations = {
  set?: InputMaybe<DevMilestoneStatus>;
};

export enum DevMilestoneType {
  Foundation = 'FOUNDATION',
  Integration = 'INTEGRATION',
  Value = 'VALUE'
}

/** DevMilestoneType filters */
export type DevMilestoneTypeEnumScalarFilters = {
  eq?: InputMaybe<DevMilestoneType>;
  in?: InputMaybe<Array<DevMilestoneType>>;
};

/** DevMilestoneType mutations */
export type DevMilestoneTypeEnumScalarMutations = {
  set?: InputMaybe<DevMilestoneType>;
};

export type DevMilestoneUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  demoCriteria?: InputMaybe<StringScalarMutations>;
  milestoneType?: InputMaybe<DevMilestoneTypeEnumScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<DevMilestoneStatusEnumScalarMutations>;
  targetDate?: InputMaybe<DateTimeScalarMutations>;
  workstreamDeliverables?: InputMaybe<ListStringMutations>;
};

export type DevMilestoneWhere = {
  AND?: InputMaybe<Array<DevMilestoneWhere>>;
  NOT?: InputMaybe<DevMilestoneWhere>;
  OR?: InputMaybe<Array<DevMilestoneWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  demoCriteria?: InputMaybe<StringScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<DevMilestoneDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  milestoneType?: InputMaybe<DevMilestoneTypeEnumScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  project?: InputMaybe<ProjectWhere>;
  projectConnection?: InputMaybe<DevMilestoneProjectConnectionWhere>;
  status?: InputMaybe<DevMilestoneStatusEnumScalarFilters>;
  targetDate?: InputMaybe<DateTimeScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
  workstreamDeliverables?: InputMaybe<StringListFilters>;
};

export type DevMilestonesConnection = {
  __typename?: 'DevMilestonesConnection';
  aggregate: DevMilestoneAggregate;
  edges: Array<DevMilestoneEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DevWorkstream = {
  __typename?: 'DevWorkstream';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: DevWorkstreamDomainConnection;
  id: Scalars['ID']['output'];
  interfaceContracts: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Scalars['String']['output']>;
  project?: Maybe<Project>;
  projectConnection: DevWorkstreamProjectConnection;
  status: DevWorkstreamStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type DevWorkstreamAggregate = {
  __typename?: 'DevWorkstreamAggregate';
  count: Count;
  node: DevWorkstreamAggregateNode;
};

export type DevWorkstreamAggregateNode = {
  __typename?: 'DevWorkstreamAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  owner: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type DevWorkstreamConnectWhere = {
  node: DevWorkstreamWhere;
};

export type DevWorkstreamCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<DevWorkstreamDomainFieldInput>;
  interfaceContracts: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  owner?: InputMaybe<Scalars['String']['input']>;
  project?: InputMaybe<DevWorkstreamProjectFieldInput>;
  status: DevWorkstreamStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DevWorkstreamDeleteInput = {
  domain?: InputMaybe<DevWorkstreamDomainDeleteFieldInput>;
  project?: InputMaybe<DevWorkstreamProjectDeleteFieldInput>;
};

export type DevWorkstreamDomainConnection = {
  __typename?: 'DevWorkstreamDomainConnection';
  edges: Array<DevWorkstreamDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DevWorkstreamDomainConnectionWhere = {
  AND?: InputMaybe<Array<DevWorkstreamDomainConnectionWhere>>;
  NOT?: InputMaybe<DevWorkstreamDomainConnectionWhere>;
  OR?: InputMaybe<Array<DevWorkstreamDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type DevWorkstreamDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type DevWorkstreamDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<DevWorkstreamDomainConnectionWhere>;
};

export type DevWorkstreamDomainFieldInput = {
  create?: InputMaybe<DevWorkstreamDomainCreateFieldInput>;
};

export type DevWorkstreamDomainRelationship = {
  __typename?: 'DevWorkstreamDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type DevWorkstreamEdge = {
  __typename?: 'DevWorkstreamEdge';
  cursor: Scalars['String']['output'];
  node: DevWorkstream;
};

export type DevWorkstreamProjectConnection = {
  __typename?: 'DevWorkstreamProjectConnection';
  edges: Array<DevWorkstreamProjectRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DevWorkstreamProjectConnectionWhere = {
  AND?: InputMaybe<Array<DevWorkstreamProjectConnectionWhere>>;
  NOT?: InputMaybe<DevWorkstreamProjectConnectionWhere>;
  OR?: InputMaybe<Array<DevWorkstreamProjectConnectionWhere>>;
  node?: InputMaybe<ProjectWhere>;
};

export type DevWorkstreamProjectCreateFieldInput = {
  node: ProjectCreateInput;
};

export type DevWorkstreamProjectDeleteFieldInput = {
  delete?: InputMaybe<ProjectDeleteInput>;
  where?: InputMaybe<DevWorkstreamProjectConnectionWhere>;
};

export type DevWorkstreamProjectFieldInput = {
  create?: InputMaybe<DevWorkstreamProjectCreateFieldInput>;
};

export type DevWorkstreamProjectRelationship = {
  __typename?: 'DevWorkstreamProjectRelationship';
  cursor: Scalars['String']['output'];
  node: Project;
};

export type DevWorkstreamRelationshipFilters = {
  /** Filter type where all of the related DevWorkstreams match this filter */
  all?: InputMaybe<DevWorkstreamWhere>;
  /** Filter type where none of the related DevWorkstreams match this filter */
  none?: InputMaybe<DevWorkstreamWhere>;
  /** Filter type where one of the related DevWorkstreams match this filter */
  single?: InputMaybe<DevWorkstreamWhere>;
  /** Filter type where some of the related DevWorkstreams match this filter */
  some?: InputMaybe<DevWorkstreamWhere>;
};

/** Fields to sort DevWorkstreams by. The order in which sorts are applied is not guaranteed when specifying many fields in one DevWorkstreamSort object. */
export type DevWorkstreamSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  owner?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum DevWorkstreamStatus {
  Active = 'ACTIVE',
  Blocked = 'BLOCKED',
  Complete = 'COMPLETE'
}

/** DevWorkstreamStatus filters */
export type DevWorkstreamStatusEnumScalarFilters = {
  eq?: InputMaybe<DevWorkstreamStatus>;
  in?: InputMaybe<Array<DevWorkstreamStatus>>;
};

/** DevWorkstreamStatus mutations */
export type DevWorkstreamStatusEnumScalarMutations = {
  set?: InputMaybe<DevWorkstreamStatus>;
};

export type DevWorkstreamUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  interfaceContracts?: InputMaybe<ListStringMutations>;
  name?: InputMaybe<StringScalarMutations>;
  owner?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<DevWorkstreamStatusEnumScalarMutations>;
};

export type DevWorkstreamWhere = {
  AND?: InputMaybe<Array<DevWorkstreamWhere>>;
  NOT?: InputMaybe<DevWorkstreamWhere>;
  OR?: InputMaybe<Array<DevWorkstreamWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<DevWorkstreamDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  interfaceContracts?: InputMaybe<StringListFilters>;
  name?: InputMaybe<StringScalarFilters>;
  owner?: InputMaybe<StringScalarFilters>;
  project?: InputMaybe<ProjectWhere>;
  projectConnection?: InputMaybe<DevWorkstreamProjectConnectionWhere>;
  status?: InputMaybe<DevWorkstreamStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type DevWorkstreamsConnection = {
  __typename?: 'DevWorkstreamsConnection';
  aggregate: DevWorkstreamAggregate;
  edges: Array<DevWorkstreamEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DiscoveryHealth = {
  __typename?: 'DiscoveryHealth';
  ideasWithNoAssumptions: Scalars['Int']['output'];
  orphanedOpportunities: Scalars['Int']['output'];
  totalAssumptions: Scalars['Int']['output'];
  totalExperiments: Scalars['Int']['output'];
  totalIdeas: Scalars['Int']['output'];
  totalObjectives: Scalars['Int']['output'];
  totalOpportunities: Scalars['Int']['output'];
  untestedHighImportanceAssumptions: Scalars['Int']['output'];
};

export type Domain = {
  __typename?: 'Domain';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  organization?: Maybe<Organization>;
  organizationConnection: DomainOrganizationConnection;
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  users: Array<User>;
  usersConnection: DomainUsersConnection;
};


export type DomainUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<UserSort>>;
  where?: InputMaybe<UserWhere>;
};


export type DomainUsersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DomainUsersConnectionSort>>;
  where?: InputMaybe<DomainUsersConnectionWhere>;
};

export type DomainAggregate = {
  __typename?: 'DomainAggregate';
  count: Count;
  node: DomainAggregateNode;
};

export type DomainAggregateNode = {
  __typename?: 'DomainAggregateNode';
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  slug: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type DomainConnectInput = {
  users?: InputMaybe<Array<DomainUsersConnectFieldInput>>;
};

export type DomainConnectWhere = {
  node: DomainWhere;
};

export type DomainCreateInput = {
  apiKey?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organization?: InputMaybe<DomainOrganizationFieldInput>;
  slug: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  users?: InputMaybe<DomainUsersFieldInput>;
};

export type DomainDeleteInput = {
  organization?: InputMaybe<DomainOrganizationDeleteFieldInput>;
  users?: InputMaybe<Array<DomainUsersDeleteFieldInput>>;
};

export type DomainDisconnectInput = {
  users?: InputMaybe<Array<DomainUsersDisconnectFieldInput>>;
};

export type DomainEdge = {
  __typename?: 'DomainEdge';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type DomainOrganizationConnection = {
  __typename?: 'DomainOrganizationConnection';
  edges: Array<DomainOrganizationRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DomainOrganizationConnectionWhere = {
  AND?: InputMaybe<Array<DomainOrganizationConnectionWhere>>;
  NOT?: InputMaybe<DomainOrganizationConnectionWhere>;
  OR?: InputMaybe<Array<DomainOrganizationConnectionWhere>>;
  node?: InputMaybe<OrganizationWhere>;
};

export type DomainOrganizationCreateFieldInput = {
  node: OrganizationCreateInput;
};

export type DomainOrganizationDeleteFieldInput = {
  delete?: InputMaybe<OrganizationDeleteInput>;
  where?: InputMaybe<DomainOrganizationConnectionWhere>;
};

export type DomainOrganizationFieldInput = {
  create?: InputMaybe<DomainOrganizationCreateFieldInput>;
};

export type DomainOrganizationRelationship = {
  __typename?: 'DomainOrganizationRelationship';
  cursor: Scalars['String']['output'];
  node: Organization;
};

export type DomainRelationshipFilters = {
  /** Filter type where all of the related Domains match this filter */
  all?: InputMaybe<DomainWhere>;
  /** Filter type where none of the related Domains match this filter */
  none?: InputMaybe<DomainWhere>;
  /** Filter type where one of the related Domains match this filter */
  single?: InputMaybe<DomainWhere>;
  /** Filter type where some of the related Domains match this filter */
  some?: InputMaybe<DomainWhere>;
};

/** Fields to sort Domains by. The order in which sorts are applied is not guaranteed when specifying many fields in one DomainSort object. */
export type DomainSort = {
  apiKey?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  slug?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export type DomainUpdateInput = {
  apiKey?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  slug?: InputMaybe<StringScalarMutations>;
  users?: InputMaybe<Array<DomainUsersUpdateFieldInput>>;
};

export type DomainUserUsersAggregateSelection = {
  __typename?: 'DomainUserUsersAggregateSelection';
  count: CountConnection;
  edge?: Maybe<DomainUserUsersEdgeAggregateSelection>;
  node?: Maybe<DomainUserUsersNodeAggregateSelection>;
};

export type DomainUserUsersEdgeAggregateSelection = {
  __typename?: 'DomainUserUsersEdgeAggregateSelection';
  joinedAt: DateTimeAggregateSelection;
  role: StringAggregateSelection;
};

export type DomainUserUsersNodeAggregateSelection = {
  __typename?: 'DomainUserUsersNodeAggregateSelection';
  createdAt: DateTimeAggregateSelection;
  displayName: StringAggregateSelection;
  email: StringAggregateSelection;
  externalId: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type DomainUsersAggregateInput = {
  AND?: InputMaybe<Array<DomainUsersAggregateInput>>;
  NOT?: InputMaybe<DomainUsersAggregateInput>;
  OR?: InputMaybe<Array<DomainUsersAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  edge?: InputMaybe<MemberOfPropertiesAggregationWhereInput>;
  node?: InputMaybe<DomainUsersNodeAggregationWhereInput>;
};

export type DomainUsersConnectFieldInput = {
  connect?: InputMaybe<Array<UserConnectInput>>;
  edge: MemberOfPropertiesCreateInput;
  where?: InputMaybe<UserConnectWhere>;
};

export type DomainUsersConnection = {
  __typename?: 'DomainUsersConnection';
  aggregate: DomainUserUsersAggregateSelection;
  edges: Array<DomainUsersRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DomainUsersConnectionAggregateInput = {
  AND?: InputMaybe<Array<DomainUsersConnectionAggregateInput>>;
  NOT?: InputMaybe<DomainUsersConnectionAggregateInput>;
  OR?: InputMaybe<Array<DomainUsersConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  edge?: InputMaybe<MemberOfPropertiesAggregationWhereInput>;
  node?: InputMaybe<DomainUsersNodeAggregationWhereInput>;
};

export type DomainUsersConnectionFilters = {
  /** Filter Domains by aggregating results on related DomainUsersConnections */
  aggregate?: InputMaybe<DomainUsersConnectionAggregateInput>;
  /** Return Domains where all of the related DomainUsersConnections match this filter */
  all?: InputMaybe<DomainUsersConnectionWhere>;
  /** Return Domains where none of the related DomainUsersConnections match this filter */
  none?: InputMaybe<DomainUsersConnectionWhere>;
  /** Return Domains where one of the related DomainUsersConnections match this filter */
  single?: InputMaybe<DomainUsersConnectionWhere>;
  /** Return Domains where some of the related DomainUsersConnections match this filter */
  some?: InputMaybe<DomainUsersConnectionWhere>;
};

export type DomainUsersConnectionSort = {
  edge?: InputMaybe<MemberOfPropertiesSort>;
  node?: InputMaybe<UserSort>;
};

export type DomainUsersConnectionWhere = {
  AND?: InputMaybe<Array<DomainUsersConnectionWhere>>;
  NOT?: InputMaybe<DomainUsersConnectionWhere>;
  OR?: InputMaybe<Array<DomainUsersConnectionWhere>>;
  edge?: InputMaybe<MemberOfPropertiesWhere>;
  node?: InputMaybe<UserWhere>;
};

export type DomainUsersCreateFieldInput = {
  edge: MemberOfPropertiesCreateInput;
  node: UserCreateInput;
};

export type DomainUsersDeleteFieldInput = {
  delete?: InputMaybe<UserDeleteInput>;
  where?: InputMaybe<DomainUsersConnectionWhere>;
};

export type DomainUsersDisconnectFieldInput = {
  disconnect?: InputMaybe<UserDisconnectInput>;
  where?: InputMaybe<DomainUsersConnectionWhere>;
};

export type DomainUsersFieldInput = {
  connect?: InputMaybe<Array<DomainUsersConnectFieldInput>>;
  create?: InputMaybe<Array<DomainUsersCreateFieldInput>>;
};

export type DomainUsersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<DomainUsersNodeAggregationWhereInput>>;
  NOT?: InputMaybe<DomainUsersNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<DomainUsersNodeAggregationWhereInput>>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  displayName?: InputMaybe<StringScalarAggregationFilters>;
  email?: InputMaybe<StringScalarAggregationFilters>;
  externalId?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type DomainUsersRelationship = {
  __typename?: 'DomainUsersRelationship';
  cursor: Scalars['String']['output'];
  node: User;
  properties: MemberOfProperties;
};

export type DomainUsersUpdateConnectionInput = {
  edge?: InputMaybe<MemberOfPropertiesUpdateInput>;
  node?: InputMaybe<UserUpdateInput>;
  where?: InputMaybe<DomainUsersConnectionWhere>;
};

export type DomainUsersUpdateFieldInput = {
  connect?: InputMaybe<Array<DomainUsersConnectFieldInput>>;
  create?: InputMaybe<Array<DomainUsersCreateFieldInput>>;
  delete?: InputMaybe<Array<DomainUsersDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<DomainUsersDisconnectFieldInput>>;
  update?: InputMaybe<DomainUsersUpdateConnectionInput>;
};

export type DomainWhere = {
  AND?: InputMaybe<Array<DomainWhere>>;
  NOT?: InputMaybe<DomainWhere>;
  OR?: InputMaybe<Array<DomainWhere>>;
  apiKey?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  organization?: InputMaybe<OrganizationWhere>;
  organizationConnection?: InputMaybe<DomainOrganizationConnectionWhere>;
  slug?: InputMaybe<StringScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
  users?: InputMaybe<UserRelationshipFilters>;
  usersConnection?: InputMaybe<DomainUsersConnectionFilters>;
};

export type DomainsConnection = {
  __typename?: 'DomainsConnection';
  aggregate: DomainAggregate;
  edges: Array<DomainEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum EffortLevel {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

/** EffortLevel filters */
export type EffortLevelEnumScalarFilters = {
  eq?: InputMaybe<EffortLevel>;
  in?: InputMaybe<Array<EffortLevel>>;
};

/** EffortLevel mutations */
export type EffortLevelEnumScalarMutations = {
  set?: InputMaybe<EffortLevel>;
};

export type Enhancement = {
  __typename?: 'Enhancement';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: EnhancementDomainConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parent?: Maybe<Epic>;
  parentConnection: EnhancementParentConnection;
  status: EnhancementStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type EnhancementAggregate = {
  __typename?: 'EnhancementAggregate';
  count: Count;
  node: EnhancementAggregateNode;
};

export type EnhancementAggregateNode = {
  __typename?: 'EnhancementAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type EnhancementCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<EnhancementDomainFieldInput>;
  name: Scalars['String']['input'];
  parent?: InputMaybe<EnhancementParentFieldInput>;
  status: EnhancementStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type EnhancementDeleteInput = {
  domain?: InputMaybe<EnhancementDomainDeleteFieldInput>;
  parent?: InputMaybe<EnhancementParentDeleteFieldInput>;
};

export type EnhancementDomainConnection = {
  __typename?: 'EnhancementDomainConnection';
  edges: Array<EnhancementDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EnhancementDomainConnectionWhere = {
  AND?: InputMaybe<Array<EnhancementDomainConnectionWhere>>;
  NOT?: InputMaybe<EnhancementDomainConnectionWhere>;
  OR?: InputMaybe<Array<EnhancementDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type EnhancementDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type EnhancementDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<EnhancementDomainConnectionWhere>;
};

export type EnhancementDomainFieldInput = {
  create?: InputMaybe<EnhancementDomainCreateFieldInput>;
};

export type EnhancementDomainRelationship = {
  __typename?: 'EnhancementDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type EnhancementEdge = {
  __typename?: 'EnhancementEdge';
  cursor: Scalars['String']['output'];
  node: Enhancement;
};

export type EnhancementParentConnection = {
  __typename?: 'EnhancementParentConnection';
  edges: Array<EnhancementParentRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EnhancementParentConnectionWhere = {
  AND?: InputMaybe<Array<EnhancementParentConnectionWhere>>;
  NOT?: InputMaybe<EnhancementParentConnectionWhere>;
  OR?: InputMaybe<Array<EnhancementParentConnectionWhere>>;
  node?: InputMaybe<EpicWhere>;
};

export type EnhancementParentCreateFieldInput = {
  node: EpicCreateInput;
};

export type EnhancementParentDeleteFieldInput = {
  delete?: InputMaybe<EpicDeleteInput>;
  where?: InputMaybe<EnhancementParentConnectionWhere>;
};

export type EnhancementParentFieldInput = {
  create?: InputMaybe<EnhancementParentCreateFieldInput>;
};

export type EnhancementParentRelationship = {
  __typename?: 'EnhancementParentRelationship';
  cursor: Scalars['String']['output'];
  node: Epic;
};

/** Fields to sort Enhancements by. The order in which sorts are applied is not guaranteed when specifying many fields in one EnhancementSort object. */
export type EnhancementSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum EnhancementStatus {
  Done = 'DONE',
  InProgress = 'IN_PROGRESS',
  Todo = 'TODO'
}

/** EnhancementStatus filters */
export type EnhancementStatusEnumScalarFilters = {
  eq?: InputMaybe<EnhancementStatus>;
  in?: InputMaybe<Array<EnhancementStatus>>;
};

/** EnhancementStatus mutations */
export type EnhancementStatusEnumScalarMutations = {
  set?: InputMaybe<EnhancementStatus>;
};

export type EnhancementUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<EnhancementStatusEnumScalarMutations>;
};

export type EnhancementWhere = {
  AND?: InputMaybe<Array<EnhancementWhere>>;
  NOT?: InputMaybe<EnhancementWhere>;
  OR?: InputMaybe<Array<EnhancementWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<EnhancementDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  parent?: InputMaybe<EpicWhere>;
  parentConnection?: InputMaybe<EnhancementParentConnectionWhere>;
  status?: InputMaybe<EnhancementStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type EnhancementsConnection = {
  __typename?: 'EnhancementsConnection';
  aggregate: EnhancementAggregate;
  edges: Array<EnhancementEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Epic = {
  __typename?: 'Epic';
  body?: Maybe<Scalars['String']['output']>;
  children: Array<Story>;
  childrenConnection: EpicChildrenConnection;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: EpicDomainConnection;
  id: Scalars['ID']['output'];
  milestone?: Maybe<DevMilestone>;
  milestoneConnection: EpicMilestoneConnection;
  name: Scalars['String']['output'];
  parent?: Maybe<Project>;
  parentConnection: EpicParentConnection;
  status: EpicStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workstream?: Maybe<DevWorkstream>;
  workstreamConnection: EpicWorkstreamConnection;
};


export type EpicChildrenArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<StorySort>>;
  where?: InputMaybe<StoryWhere>;
};


export type EpicChildrenConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<EpicChildrenConnectionSort>>;
  where?: InputMaybe<EpicChildrenConnectionWhere>;
};

export type EpicAggregate = {
  __typename?: 'EpicAggregate';
  count: Count;
  node: EpicAggregateNode;
};

export type EpicAggregateNode = {
  __typename?: 'EpicAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type EpicChildrenAggregateInput = {
  AND?: InputMaybe<Array<EpicChildrenAggregateInput>>;
  NOT?: InputMaybe<EpicChildrenAggregateInput>;
  OR?: InputMaybe<Array<EpicChildrenAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<EpicChildrenNodeAggregationWhereInput>;
};

export type EpicChildrenConnectFieldInput = {
  connect?: InputMaybe<Array<StoryConnectInput>>;
  where?: InputMaybe<StoryConnectWhere>;
};

export type EpicChildrenConnection = {
  __typename?: 'EpicChildrenConnection';
  aggregate: EpicStoryChildrenAggregateSelection;
  edges: Array<EpicChildrenRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EpicChildrenConnectionAggregateInput = {
  AND?: InputMaybe<Array<EpicChildrenConnectionAggregateInput>>;
  NOT?: InputMaybe<EpicChildrenConnectionAggregateInput>;
  OR?: InputMaybe<Array<EpicChildrenConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<EpicChildrenNodeAggregationWhereInput>;
};

export type EpicChildrenConnectionFilters = {
  /** Filter Epics by aggregating results on related EpicChildrenConnections */
  aggregate?: InputMaybe<EpicChildrenConnectionAggregateInput>;
  /** Return Epics where all of the related EpicChildrenConnections match this filter */
  all?: InputMaybe<EpicChildrenConnectionWhere>;
  /** Return Epics where none of the related EpicChildrenConnections match this filter */
  none?: InputMaybe<EpicChildrenConnectionWhere>;
  /** Return Epics where one of the related EpicChildrenConnections match this filter */
  single?: InputMaybe<EpicChildrenConnectionWhere>;
  /** Return Epics where some of the related EpicChildrenConnections match this filter */
  some?: InputMaybe<EpicChildrenConnectionWhere>;
};

export type EpicChildrenConnectionSort = {
  node?: InputMaybe<StorySort>;
};

export type EpicChildrenConnectionWhere = {
  AND?: InputMaybe<Array<EpicChildrenConnectionWhere>>;
  NOT?: InputMaybe<EpicChildrenConnectionWhere>;
  OR?: InputMaybe<Array<EpicChildrenConnectionWhere>>;
  node?: InputMaybe<StoryWhere>;
};

export type EpicChildrenCreateFieldInput = {
  node: StoryCreateInput;
};

export type EpicChildrenDeleteFieldInput = {
  delete?: InputMaybe<StoryDeleteInput>;
  where?: InputMaybe<EpicChildrenConnectionWhere>;
};

export type EpicChildrenDisconnectFieldInput = {
  disconnect?: InputMaybe<StoryDisconnectInput>;
  where?: InputMaybe<EpicChildrenConnectionWhere>;
};

export type EpicChildrenFieldInput = {
  connect?: InputMaybe<Array<EpicChildrenConnectFieldInput>>;
  create?: InputMaybe<Array<EpicChildrenCreateFieldInput>>;
};

export type EpicChildrenNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<EpicChildrenNodeAggregationWhereInput>>;
  NOT?: InputMaybe<EpicChildrenNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<EpicChildrenNodeAggregationWhereInput>>;
  acceptanceCriteria?: InputMaybe<StringScalarAggregationFilters>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type EpicChildrenRelationship = {
  __typename?: 'EpicChildrenRelationship';
  cursor: Scalars['String']['output'];
  node: Story;
};

export type EpicChildrenUpdateConnectionInput = {
  node?: InputMaybe<StoryUpdateInput>;
  where?: InputMaybe<EpicChildrenConnectionWhere>;
};

export type EpicChildrenUpdateFieldInput = {
  connect?: InputMaybe<Array<EpicChildrenConnectFieldInput>>;
  create?: InputMaybe<Array<EpicChildrenCreateFieldInput>>;
  delete?: InputMaybe<Array<EpicChildrenDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<EpicChildrenDisconnectFieldInput>>;
  update?: InputMaybe<EpicChildrenUpdateConnectionInput>;
};

export type EpicConnectInput = {
  children?: InputMaybe<Array<EpicChildrenConnectFieldInput>>;
};

export type EpicConnectWhere = {
  node: EpicWhere;
};

export type EpicCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  children?: InputMaybe<EpicChildrenFieldInput>;
  domain?: InputMaybe<EpicDomainFieldInput>;
  milestone?: InputMaybe<EpicMilestoneFieldInput>;
  name: Scalars['String']['input'];
  parent?: InputMaybe<EpicParentFieldInput>;
  status: EpicStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  workstream?: InputMaybe<EpicWorkstreamFieldInput>;
};

export type EpicDeleteInput = {
  children?: InputMaybe<Array<EpicChildrenDeleteFieldInput>>;
  domain?: InputMaybe<EpicDomainDeleteFieldInput>;
  milestone?: InputMaybe<EpicMilestoneDeleteFieldInput>;
  parent?: InputMaybe<EpicParentDeleteFieldInput>;
  workstream?: InputMaybe<EpicWorkstreamDeleteFieldInput>;
};

export type EpicDisconnectInput = {
  children?: InputMaybe<Array<EpicChildrenDisconnectFieldInput>>;
};

export type EpicDomainConnection = {
  __typename?: 'EpicDomainConnection';
  edges: Array<EpicDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EpicDomainConnectionWhere = {
  AND?: InputMaybe<Array<EpicDomainConnectionWhere>>;
  NOT?: InputMaybe<EpicDomainConnectionWhere>;
  OR?: InputMaybe<Array<EpicDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type EpicDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type EpicDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<EpicDomainConnectionWhere>;
};

export type EpicDomainFieldInput = {
  create?: InputMaybe<EpicDomainCreateFieldInput>;
};

export type EpicDomainRelationship = {
  __typename?: 'EpicDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type EpicEdge = {
  __typename?: 'EpicEdge';
  cursor: Scalars['String']['output'];
  node: Epic;
};

export type EpicMilestoneConnection = {
  __typename?: 'EpicMilestoneConnection';
  edges: Array<EpicMilestoneRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EpicMilestoneConnectionWhere = {
  AND?: InputMaybe<Array<EpicMilestoneConnectionWhere>>;
  NOT?: InputMaybe<EpicMilestoneConnectionWhere>;
  OR?: InputMaybe<Array<EpicMilestoneConnectionWhere>>;
  node?: InputMaybe<DevMilestoneWhere>;
};

export type EpicMilestoneCreateFieldInput = {
  node: DevMilestoneCreateInput;
};

export type EpicMilestoneDeleteFieldInput = {
  delete?: InputMaybe<DevMilestoneDeleteInput>;
  where?: InputMaybe<EpicMilestoneConnectionWhere>;
};

export type EpicMilestoneFieldInput = {
  create?: InputMaybe<EpicMilestoneCreateFieldInput>;
};

export type EpicMilestoneRelationship = {
  __typename?: 'EpicMilestoneRelationship';
  cursor: Scalars['String']['output'];
  node: DevMilestone;
};

export type EpicParentConnection = {
  __typename?: 'EpicParentConnection';
  edges: Array<EpicParentRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EpicParentConnectionWhere = {
  AND?: InputMaybe<Array<EpicParentConnectionWhere>>;
  NOT?: InputMaybe<EpicParentConnectionWhere>;
  OR?: InputMaybe<Array<EpicParentConnectionWhere>>;
  node?: InputMaybe<ProjectWhere>;
};

export type EpicParentCreateFieldInput = {
  node: ProjectCreateInput;
};

export type EpicParentDeleteFieldInput = {
  delete?: InputMaybe<ProjectDeleteInput>;
  where?: InputMaybe<EpicParentConnectionWhere>;
};

export type EpicParentFieldInput = {
  create?: InputMaybe<EpicParentCreateFieldInput>;
};

export type EpicParentRelationship = {
  __typename?: 'EpicParentRelationship';
  cursor: Scalars['String']['output'];
  node: Project;
};

export type EpicRelationshipFilters = {
  /** Filter type where all of the related Epics match this filter */
  all?: InputMaybe<EpicWhere>;
  /** Filter type where none of the related Epics match this filter */
  none?: InputMaybe<EpicWhere>;
  /** Filter type where one of the related Epics match this filter */
  single?: InputMaybe<EpicWhere>;
  /** Filter type where some of the related Epics match this filter */
  some?: InputMaybe<EpicWhere>;
};

/** Fields to sort Epics by. The order in which sorts are applied is not guaranteed when specifying many fields in one EpicSort object. */
export type EpicSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum EpicStatus {
  Complete = 'COMPLETE',
  Draft = 'DRAFT',
  InProgress = 'IN_PROGRESS',
  Ready = 'READY'
}

/** EpicStatus filters */
export type EpicStatusEnumScalarFilters = {
  eq?: InputMaybe<EpicStatus>;
  in?: InputMaybe<Array<EpicStatus>>;
};

/** EpicStatus mutations */
export type EpicStatusEnumScalarMutations = {
  set?: InputMaybe<EpicStatus>;
};

export type EpicStoryChildrenAggregateSelection = {
  __typename?: 'EpicStoryChildrenAggregateSelection';
  count: CountConnection;
  node?: Maybe<EpicStoryChildrenNodeAggregateSelection>;
};

export type EpicStoryChildrenNodeAggregateSelection = {
  __typename?: 'EpicStoryChildrenNodeAggregateSelection';
  acceptanceCriteria: StringAggregateSelection;
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type EpicSummary = {
  __typename?: 'EpicSummary';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: EpicStatus;
  stories: Array<StorySummary>;
};

export type EpicUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  children?: InputMaybe<Array<EpicChildrenUpdateFieldInput>>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<EpicStatusEnumScalarMutations>;
};

export type EpicWhere = {
  AND?: InputMaybe<Array<EpicWhere>>;
  NOT?: InputMaybe<EpicWhere>;
  OR?: InputMaybe<Array<EpicWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  children?: InputMaybe<StoryRelationshipFilters>;
  childrenConnection?: InputMaybe<EpicChildrenConnectionFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<EpicDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  milestone?: InputMaybe<DevMilestoneWhere>;
  milestoneConnection?: InputMaybe<EpicMilestoneConnectionWhere>;
  name?: InputMaybe<StringScalarFilters>;
  parent?: InputMaybe<ProjectWhere>;
  parentConnection?: InputMaybe<EpicParentConnectionWhere>;
  status?: InputMaybe<EpicStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
  workstream?: InputMaybe<DevWorkstreamWhere>;
  workstreamConnection?: InputMaybe<EpicWorkstreamConnectionWhere>;
};

export type EpicWorkstreamConnection = {
  __typename?: 'EpicWorkstreamConnection';
  edges: Array<EpicWorkstreamRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EpicWorkstreamConnectionWhere = {
  AND?: InputMaybe<Array<EpicWorkstreamConnectionWhere>>;
  NOT?: InputMaybe<EpicWorkstreamConnectionWhere>;
  OR?: InputMaybe<Array<EpicWorkstreamConnectionWhere>>;
  node?: InputMaybe<DevWorkstreamWhere>;
};

export type EpicWorkstreamCreateFieldInput = {
  node: DevWorkstreamCreateInput;
};

export type EpicWorkstreamDeleteFieldInput = {
  delete?: InputMaybe<DevWorkstreamDeleteInput>;
  where?: InputMaybe<EpicWorkstreamConnectionWhere>;
};

export type EpicWorkstreamFieldInput = {
  create?: InputMaybe<EpicWorkstreamCreateFieldInput>;
};

export type EpicWorkstreamRelationship = {
  __typename?: 'EpicWorkstreamRelationship';
  cursor: Scalars['String']['output'];
  node: DevWorkstream;
};

export type EpicsConnection = {
  __typename?: 'EpicsConnection';
  aggregate: EpicAggregate;
  edges: Array<EpicEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Experiment = {
  __typename?: 'Experiment';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: ExperimentDomainConnection;
  duration?: Maybe<Scalars['String']['output']>;
  effort?: Maybe<EffortLevel>;
  id: Scalars['ID']['output'];
  learnings?: Maybe<Scalars['String']['output']>;
  method?: Maybe<ExperimentMethod>;
  name: Scalars['String']['output'];
  result?: Maybe<ExperimentResult>;
  status: ExperimentStatus;
  successCriteria?: Maybe<Scalars['String']['output']>;
  tests: Array<Assumption>;
  testsConnection: ExperimentTestsConnection;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type ExperimentTestsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<AssumptionSort>>;
  where?: InputMaybe<AssumptionWhere>;
};


export type ExperimentTestsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ExperimentTestsConnectionSort>>;
  where?: InputMaybe<ExperimentTestsConnectionWhere>;
};

export type ExperimentAggregate = {
  __typename?: 'ExperimentAggregate';
  count: Count;
  node: ExperimentAggregateNode;
};

export type ExperimentAggregateNode = {
  __typename?: 'ExperimentAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  duration: StringAggregateSelection;
  learnings: StringAggregateSelection;
  name: StringAggregateSelection;
  successCriteria: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type ExperimentAssumptionTestsAggregateSelection = {
  __typename?: 'ExperimentAssumptionTestsAggregateSelection';
  count: CountConnection;
  node?: Maybe<ExperimentAssumptionTestsNodeAggregateSelection>;
};

export type ExperimentAssumptionTestsNodeAggregateSelection = {
  __typename?: 'ExperimentAssumptionTestsNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type ExperimentConnectInput = {
  tests?: InputMaybe<Array<ExperimentTestsConnectFieldInput>>;
};

export type ExperimentConnectWhere = {
  node: ExperimentWhere;
};

export type ExperimentCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<ExperimentDomainFieldInput>;
  duration?: InputMaybe<Scalars['String']['input']>;
  effort?: InputMaybe<EffortLevel>;
  learnings?: InputMaybe<Scalars['String']['input']>;
  method?: InputMaybe<ExperimentMethod>;
  name: Scalars['String']['input'];
  result?: InputMaybe<ExperimentResult>;
  status: ExperimentStatus;
  successCriteria?: InputMaybe<Scalars['String']['input']>;
  tests?: InputMaybe<ExperimentTestsFieldInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type ExperimentDeleteInput = {
  domain?: InputMaybe<ExperimentDomainDeleteFieldInput>;
  tests?: InputMaybe<Array<ExperimentTestsDeleteFieldInput>>;
};

export type ExperimentDisconnectInput = {
  tests?: InputMaybe<Array<ExperimentTestsDisconnectFieldInput>>;
};

export type ExperimentDomainConnection = {
  __typename?: 'ExperimentDomainConnection';
  edges: Array<ExperimentDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ExperimentDomainConnectionWhere = {
  AND?: InputMaybe<Array<ExperimentDomainConnectionWhere>>;
  NOT?: InputMaybe<ExperimentDomainConnectionWhere>;
  OR?: InputMaybe<Array<ExperimentDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type ExperimentDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type ExperimentDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<ExperimentDomainConnectionWhere>;
};

export type ExperimentDomainFieldInput = {
  create?: InputMaybe<ExperimentDomainCreateFieldInput>;
};

export type ExperimentDomainRelationship = {
  __typename?: 'ExperimentDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type ExperimentEdge = {
  __typename?: 'ExperimentEdge';
  cursor: Scalars['String']['output'];
  node: Experiment;
};

export enum ExperimentMethod {
  AbTest = 'AB_TEST',
  ConciergeMvp = 'CONCIERGE_MVP',
  DataAnalysis = 'DATA_ANALYSIS',
  FakeDoor = 'FAKE_DOOR',
  PrototypeTest = 'PROTOTYPE_TEST',
  Survey = 'SURVEY',
  UserInterview = 'USER_INTERVIEW'
}

/** ExperimentMethod filters */
export type ExperimentMethodEnumScalarFilters = {
  eq?: InputMaybe<ExperimentMethod>;
  in?: InputMaybe<Array<ExperimentMethod>>;
};

/** ExperimentMethod mutations */
export type ExperimentMethodEnumScalarMutations = {
  set?: InputMaybe<ExperimentMethod>;
};

export type ExperimentRelationshipFilters = {
  /** Filter type where all of the related Experiments match this filter */
  all?: InputMaybe<ExperimentWhere>;
  /** Filter type where none of the related Experiments match this filter */
  none?: InputMaybe<ExperimentWhere>;
  /** Filter type where one of the related Experiments match this filter */
  single?: InputMaybe<ExperimentWhere>;
  /** Filter type where some of the related Experiments match this filter */
  some?: InputMaybe<ExperimentWhere>;
};

export enum ExperimentResult {
  Inconclusive = 'INCONCLUSIVE',
  Invalidated = 'INVALIDATED',
  Validated = 'VALIDATED'
}

/** ExperimentResult filters */
export type ExperimentResultEnumScalarFilters = {
  eq?: InputMaybe<ExperimentResult>;
  in?: InputMaybe<Array<ExperimentResult>>;
};

/** ExperimentResult mutations */
export type ExperimentResultEnumScalarMutations = {
  set?: InputMaybe<ExperimentResult>;
};

/** Fields to sort Experiments by. The order in which sorts are applied is not guaranteed when specifying many fields in one ExperimentSort object. */
export type ExperimentSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  duration?: InputMaybe<SortDirection>;
  effort?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  learnings?: InputMaybe<SortDirection>;
  method?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  result?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  successCriteria?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum ExperimentStatus {
  Complete = 'COMPLETE',
  Planned = 'PLANNED',
  Running = 'RUNNING'
}

/** ExperimentStatus filters */
export type ExperimentStatusEnumScalarFilters = {
  eq?: InputMaybe<ExperimentStatus>;
  in?: InputMaybe<Array<ExperimentStatus>>;
};

/** ExperimentStatus mutations */
export type ExperimentStatusEnumScalarMutations = {
  set?: InputMaybe<ExperimentStatus>;
};

export type ExperimentSummary = {
  __typename?: 'ExperimentSummary';
  id: Scalars['ID']['output'];
  method?: Maybe<ExperimentMethod>;
  name: Scalars['String']['output'];
  result?: Maybe<ExperimentResult>;
  status: ExperimentStatus;
};

export type ExperimentTestsAggregateInput = {
  AND?: InputMaybe<Array<ExperimentTestsAggregateInput>>;
  NOT?: InputMaybe<ExperimentTestsAggregateInput>;
  OR?: InputMaybe<Array<ExperimentTestsAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<ExperimentTestsNodeAggregationWhereInput>;
};

export type ExperimentTestsConnectFieldInput = {
  connect?: InputMaybe<Array<AssumptionConnectInput>>;
  where?: InputMaybe<AssumptionConnectWhere>;
};

export type ExperimentTestsConnection = {
  __typename?: 'ExperimentTestsConnection';
  aggregate: ExperimentAssumptionTestsAggregateSelection;
  edges: Array<ExperimentTestsRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ExperimentTestsConnectionAggregateInput = {
  AND?: InputMaybe<Array<ExperimentTestsConnectionAggregateInput>>;
  NOT?: InputMaybe<ExperimentTestsConnectionAggregateInput>;
  OR?: InputMaybe<Array<ExperimentTestsConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<ExperimentTestsNodeAggregationWhereInput>;
};

export type ExperimentTestsConnectionFilters = {
  /** Filter Experiments by aggregating results on related ExperimentTestsConnections */
  aggregate?: InputMaybe<ExperimentTestsConnectionAggregateInput>;
  /** Return Experiments where all of the related ExperimentTestsConnections match this filter */
  all?: InputMaybe<ExperimentTestsConnectionWhere>;
  /** Return Experiments where none of the related ExperimentTestsConnections match this filter */
  none?: InputMaybe<ExperimentTestsConnectionWhere>;
  /** Return Experiments where one of the related ExperimentTestsConnections match this filter */
  single?: InputMaybe<ExperimentTestsConnectionWhere>;
  /** Return Experiments where some of the related ExperimentTestsConnections match this filter */
  some?: InputMaybe<ExperimentTestsConnectionWhere>;
};

export type ExperimentTestsConnectionSort = {
  node?: InputMaybe<AssumptionSort>;
};

export type ExperimentTestsConnectionWhere = {
  AND?: InputMaybe<Array<ExperimentTestsConnectionWhere>>;
  NOT?: InputMaybe<ExperimentTestsConnectionWhere>;
  OR?: InputMaybe<Array<ExperimentTestsConnectionWhere>>;
  node?: InputMaybe<AssumptionWhere>;
};

export type ExperimentTestsCreateFieldInput = {
  node: AssumptionCreateInput;
};

export type ExperimentTestsDeleteFieldInput = {
  delete?: InputMaybe<AssumptionDeleteInput>;
  where?: InputMaybe<ExperimentTestsConnectionWhere>;
};

export type ExperimentTestsDisconnectFieldInput = {
  disconnect?: InputMaybe<AssumptionDisconnectInput>;
  where?: InputMaybe<ExperimentTestsConnectionWhere>;
};

export type ExperimentTestsFieldInput = {
  connect?: InputMaybe<Array<ExperimentTestsConnectFieldInput>>;
  create?: InputMaybe<Array<ExperimentTestsCreateFieldInput>>;
};

export type ExperimentTestsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ExperimentTestsNodeAggregationWhereInput>>;
  NOT?: InputMaybe<ExperimentTestsNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<ExperimentTestsNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type ExperimentTestsRelationship = {
  __typename?: 'ExperimentTestsRelationship';
  cursor: Scalars['String']['output'];
  node: Assumption;
};

export type ExperimentTestsUpdateConnectionInput = {
  node?: InputMaybe<AssumptionUpdateInput>;
  where?: InputMaybe<ExperimentTestsConnectionWhere>;
};

export type ExperimentTestsUpdateFieldInput = {
  connect?: InputMaybe<Array<ExperimentTestsConnectFieldInput>>;
  create?: InputMaybe<Array<ExperimentTestsCreateFieldInput>>;
  delete?: InputMaybe<Array<ExperimentTestsDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<ExperimentTestsDisconnectFieldInput>>;
  update?: InputMaybe<ExperimentTestsUpdateConnectionInput>;
};

export type ExperimentUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  duration?: InputMaybe<StringScalarMutations>;
  effort?: InputMaybe<EffortLevelEnumScalarMutations>;
  learnings?: InputMaybe<StringScalarMutations>;
  method?: InputMaybe<ExperimentMethodEnumScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  result?: InputMaybe<ExperimentResultEnumScalarMutations>;
  status?: InputMaybe<ExperimentStatusEnumScalarMutations>;
  successCriteria?: InputMaybe<StringScalarMutations>;
  tests?: InputMaybe<Array<ExperimentTestsUpdateFieldInput>>;
};

export type ExperimentWhere = {
  AND?: InputMaybe<Array<ExperimentWhere>>;
  NOT?: InputMaybe<ExperimentWhere>;
  OR?: InputMaybe<Array<ExperimentWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<ExperimentDomainConnectionWhere>;
  duration?: InputMaybe<StringScalarFilters>;
  effort?: InputMaybe<EffortLevelEnumScalarFilters>;
  id?: InputMaybe<IdScalarFilters>;
  learnings?: InputMaybe<StringScalarFilters>;
  method?: InputMaybe<ExperimentMethodEnumScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  result?: InputMaybe<ExperimentResultEnumScalarFilters>;
  status?: InputMaybe<ExperimentStatusEnumScalarFilters>;
  successCriteria?: InputMaybe<StringScalarFilters>;
  tests?: InputMaybe<AssumptionRelationshipFilters>;
  testsConnection?: InputMaybe<ExperimentTestsConnectionFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type ExperimentsConnection = {
  __typename?: 'ExperimentsConnection';
  aggregate: ExperimentAggregate;
  edges: Array<ExperimentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Float filters */
export type FloatScalarFilters = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
};

export type GraphHealth = {
  __typename?: 'GraphHealth';
  ideasWithNoAssumptions: Scalars['Int']['output'];
  ideasWithNoDelivery: Scalars['Int']['output'];
  orphanedOpportunities: Scalars['Int']['output'];
  projectsWithNoDiscoveryLink: Scalars['Int']['output'];
  totalAssumptions: Scalars['Int']['output'];
  totalEpics: Scalars['Int']['output'];
  totalExperiments: Scalars['Int']['output'];
  totalIdeas: Scalars['Int']['output'];
  totalInitiatives: Scalars['Int']['output'];
  totalObjectives: Scalars['Int']['output'];
  totalOpportunities: Scalars['Int']['output'];
  totalProjects: Scalars['Int']['output'];
  totalStories: Scalars['Int']['output'];
  totalTasks: Scalars['Int']['output'];
  untestedHighImportanceAssumptions: Scalars['Int']['output'];
};

/** ID filters */
export type IdScalarFilters = {
  contains?: InputMaybe<Scalars['ID']['input']>;
  endsWith?: InputMaybe<Scalars['ID']['input']>;
  eq?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<Array<Scalars['ID']['input']>>;
  startsWith?: InputMaybe<Scalars['ID']['input']>;
};

export type Idea = {
  __typename?: 'Idea';
  addresses: Array<Opportunity>;
  addressesConnection: IdeaAddressesConnection;
  assumptions: Array<Assumption>;
  assumptionsConnection: IdeaAssumptionsConnection;
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: IdeaDomainConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: IdeaStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type IdeaAddressesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<OpportunitySort>>;
  where?: InputMaybe<OpportunityWhere>;
};


export type IdeaAddressesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<IdeaAddressesConnectionSort>>;
  where?: InputMaybe<IdeaAddressesConnectionWhere>;
};


export type IdeaAssumptionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<AssumptionSort>>;
  where?: InputMaybe<AssumptionWhere>;
};


export type IdeaAssumptionsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<IdeaAssumptionsConnectionSort>>;
  where?: InputMaybe<IdeaAssumptionsConnectionWhere>;
};

export type IdeaAddressesAggregateInput = {
  AND?: InputMaybe<Array<IdeaAddressesAggregateInput>>;
  NOT?: InputMaybe<IdeaAddressesAggregateInput>;
  OR?: InputMaybe<Array<IdeaAddressesAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<IdeaAddressesNodeAggregationWhereInput>;
};

export type IdeaAddressesConnectFieldInput = {
  connect?: InputMaybe<Array<OpportunityConnectInput>>;
  where?: InputMaybe<OpportunityConnectWhere>;
};

export type IdeaAddressesConnection = {
  __typename?: 'IdeaAddressesConnection';
  aggregate: IdeaOpportunityAddressesAggregateSelection;
  edges: Array<IdeaAddressesRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type IdeaAddressesConnectionAggregateInput = {
  AND?: InputMaybe<Array<IdeaAddressesConnectionAggregateInput>>;
  NOT?: InputMaybe<IdeaAddressesConnectionAggregateInput>;
  OR?: InputMaybe<Array<IdeaAddressesConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<IdeaAddressesNodeAggregationWhereInput>;
};

export type IdeaAddressesConnectionFilters = {
  /** Filter Ideas by aggregating results on related IdeaAddressesConnections */
  aggregate?: InputMaybe<IdeaAddressesConnectionAggregateInput>;
  /** Return Ideas where all of the related IdeaAddressesConnections match this filter */
  all?: InputMaybe<IdeaAddressesConnectionWhere>;
  /** Return Ideas where none of the related IdeaAddressesConnections match this filter */
  none?: InputMaybe<IdeaAddressesConnectionWhere>;
  /** Return Ideas where one of the related IdeaAddressesConnections match this filter */
  single?: InputMaybe<IdeaAddressesConnectionWhere>;
  /** Return Ideas where some of the related IdeaAddressesConnections match this filter */
  some?: InputMaybe<IdeaAddressesConnectionWhere>;
};

export type IdeaAddressesConnectionSort = {
  node?: InputMaybe<OpportunitySort>;
};

export type IdeaAddressesConnectionWhere = {
  AND?: InputMaybe<Array<IdeaAddressesConnectionWhere>>;
  NOT?: InputMaybe<IdeaAddressesConnectionWhere>;
  OR?: InputMaybe<Array<IdeaAddressesConnectionWhere>>;
  node?: InputMaybe<OpportunityWhere>;
};

export type IdeaAddressesCreateFieldInput = {
  node: OpportunityCreateInput;
};

export type IdeaAddressesDeleteFieldInput = {
  delete?: InputMaybe<OpportunityDeleteInput>;
  where?: InputMaybe<IdeaAddressesConnectionWhere>;
};

export type IdeaAddressesDisconnectFieldInput = {
  disconnect?: InputMaybe<OpportunityDisconnectInput>;
  where?: InputMaybe<IdeaAddressesConnectionWhere>;
};

export type IdeaAddressesFieldInput = {
  connect?: InputMaybe<Array<IdeaAddressesConnectFieldInput>>;
  create?: InputMaybe<Array<IdeaAddressesCreateFieldInput>>;
};

export type IdeaAddressesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<IdeaAddressesNodeAggregationWhereInput>>;
  NOT?: InputMaybe<IdeaAddressesNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<IdeaAddressesNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  hmw?: InputMaybe<StringScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type IdeaAddressesRelationship = {
  __typename?: 'IdeaAddressesRelationship';
  cursor: Scalars['String']['output'];
  node: Opportunity;
};

export type IdeaAddressesUpdateConnectionInput = {
  node?: InputMaybe<OpportunityUpdateInput>;
  where?: InputMaybe<IdeaAddressesConnectionWhere>;
};

export type IdeaAddressesUpdateFieldInput = {
  connect?: InputMaybe<Array<IdeaAddressesConnectFieldInput>>;
  create?: InputMaybe<Array<IdeaAddressesCreateFieldInput>>;
  delete?: InputMaybe<Array<IdeaAddressesDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<IdeaAddressesDisconnectFieldInput>>;
  update?: InputMaybe<IdeaAddressesUpdateConnectionInput>;
};

export type IdeaAggregate = {
  __typename?: 'IdeaAggregate';
  count: Count;
  node: IdeaAggregateNode;
};

export type IdeaAggregateNode = {
  __typename?: 'IdeaAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type IdeaAssumptionAssumptionsAggregateSelection = {
  __typename?: 'IdeaAssumptionAssumptionsAggregateSelection';
  count: CountConnection;
  node?: Maybe<IdeaAssumptionAssumptionsNodeAggregateSelection>;
};

export type IdeaAssumptionAssumptionsNodeAggregateSelection = {
  __typename?: 'IdeaAssumptionAssumptionsNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type IdeaAssumptionsAggregateInput = {
  AND?: InputMaybe<Array<IdeaAssumptionsAggregateInput>>;
  NOT?: InputMaybe<IdeaAssumptionsAggregateInput>;
  OR?: InputMaybe<Array<IdeaAssumptionsAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<IdeaAssumptionsNodeAggregationWhereInput>;
};

export type IdeaAssumptionsConnectFieldInput = {
  connect?: InputMaybe<Array<AssumptionConnectInput>>;
  where?: InputMaybe<AssumptionConnectWhere>;
};

export type IdeaAssumptionsConnection = {
  __typename?: 'IdeaAssumptionsConnection';
  aggregate: IdeaAssumptionAssumptionsAggregateSelection;
  edges: Array<IdeaAssumptionsRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type IdeaAssumptionsConnectionAggregateInput = {
  AND?: InputMaybe<Array<IdeaAssumptionsConnectionAggregateInput>>;
  NOT?: InputMaybe<IdeaAssumptionsConnectionAggregateInput>;
  OR?: InputMaybe<Array<IdeaAssumptionsConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<IdeaAssumptionsNodeAggregationWhereInput>;
};

export type IdeaAssumptionsConnectionFilters = {
  /** Filter Ideas by aggregating results on related IdeaAssumptionsConnections */
  aggregate?: InputMaybe<IdeaAssumptionsConnectionAggregateInput>;
  /** Return Ideas where all of the related IdeaAssumptionsConnections match this filter */
  all?: InputMaybe<IdeaAssumptionsConnectionWhere>;
  /** Return Ideas where none of the related IdeaAssumptionsConnections match this filter */
  none?: InputMaybe<IdeaAssumptionsConnectionWhere>;
  /** Return Ideas where one of the related IdeaAssumptionsConnections match this filter */
  single?: InputMaybe<IdeaAssumptionsConnectionWhere>;
  /** Return Ideas where some of the related IdeaAssumptionsConnections match this filter */
  some?: InputMaybe<IdeaAssumptionsConnectionWhere>;
};

export type IdeaAssumptionsConnectionSort = {
  node?: InputMaybe<AssumptionSort>;
};

export type IdeaAssumptionsConnectionWhere = {
  AND?: InputMaybe<Array<IdeaAssumptionsConnectionWhere>>;
  NOT?: InputMaybe<IdeaAssumptionsConnectionWhere>;
  OR?: InputMaybe<Array<IdeaAssumptionsConnectionWhere>>;
  node?: InputMaybe<AssumptionWhere>;
};

export type IdeaAssumptionsCreateFieldInput = {
  node: AssumptionCreateInput;
};

export type IdeaAssumptionsDeleteFieldInput = {
  delete?: InputMaybe<AssumptionDeleteInput>;
  where?: InputMaybe<IdeaAssumptionsConnectionWhere>;
};

export type IdeaAssumptionsDisconnectFieldInput = {
  disconnect?: InputMaybe<AssumptionDisconnectInput>;
  where?: InputMaybe<IdeaAssumptionsConnectionWhere>;
};

export type IdeaAssumptionsFieldInput = {
  connect?: InputMaybe<Array<IdeaAssumptionsConnectFieldInput>>;
  create?: InputMaybe<Array<IdeaAssumptionsCreateFieldInput>>;
};

export type IdeaAssumptionsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<IdeaAssumptionsNodeAggregationWhereInput>>;
  NOT?: InputMaybe<IdeaAssumptionsNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<IdeaAssumptionsNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type IdeaAssumptionsRelationship = {
  __typename?: 'IdeaAssumptionsRelationship';
  cursor: Scalars['String']['output'];
  node: Assumption;
};

export type IdeaAssumptionsUpdateConnectionInput = {
  node?: InputMaybe<AssumptionUpdateInput>;
  where?: InputMaybe<IdeaAssumptionsConnectionWhere>;
};

export type IdeaAssumptionsUpdateFieldInput = {
  connect?: InputMaybe<Array<IdeaAssumptionsConnectFieldInput>>;
  create?: InputMaybe<Array<IdeaAssumptionsCreateFieldInput>>;
  delete?: InputMaybe<Array<IdeaAssumptionsDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<IdeaAssumptionsDisconnectFieldInput>>;
  update?: InputMaybe<IdeaAssumptionsUpdateConnectionInput>;
};

export type IdeaConnectInput = {
  addresses?: InputMaybe<Array<IdeaAddressesConnectFieldInput>>;
  assumptions?: InputMaybe<Array<IdeaAssumptionsConnectFieldInput>>;
};

export type IdeaConnectWhere = {
  node: IdeaWhere;
};

export type IdeaCreateInput = {
  addresses?: InputMaybe<IdeaAddressesFieldInput>;
  assumptions?: InputMaybe<IdeaAssumptionsFieldInput>;
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<IdeaDomainFieldInput>;
  name: Scalars['String']['input'];
  status: IdeaStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type IdeaDeleteInput = {
  addresses?: InputMaybe<Array<IdeaAddressesDeleteFieldInput>>;
  assumptions?: InputMaybe<Array<IdeaAssumptionsDeleteFieldInput>>;
  domain?: InputMaybe<IdeaDomainDeleteFieldInput>;
};

export type IdeaDisconnectInput = {
  addresses?: InputMaybe<Array<IdeaAddressesDisconnectFieldInput>>;
  assumptions?: InputMaybe<Array<IdeaAssumptionsDisconnectFieldInput>>;
};

export type IdeaDomainConnection = {
  __typename?: 'IdeaDomainConnection';
  edges: Array<IdeaDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type IdeaDomainConnectionWhere = {
  AND?: InputMaybe<Array<IdeaDomainConnectionWhere>>;
  NOT?: InputMaybe<IdeaDomainConnectionWhere>;
  OR?: InputMaybe<Array<IdeaDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type IdeaDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type IdeaDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<IdeaDomainConnectionWhere>;
};

export type IdeaDomainFieldInput = {
  create?: InputMaybe<IdeaDomainCreateFieldInput>;
};

export type IdeaDomainRelationship = {
  __typename?: 'IdeaDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type IdeaEdge = {
  __typename?: 'IdeaEdge';
  cursor: Scalars['String']['output'];
  node: Idea;
};

export type IdeaOpportunityAddressesAggregateSelection = {
  __typename?: 'IdeaOpportunityAddressesAggregateSelection';
  count: CountConnection;
  node?: Maybe<IdeaOpportunityAddressesNodeAggregateSelection>;
};

export type IdeaOpportunityAddressesNodeAggregateSelection = {
  __typename?: 'IdeaOpportunityAddressesNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  hmw: StringAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type IdeaRelationshipFilters = {
  /** Filter type where all of the related Ideas match this filter */
  all?: InputMaybe<IdeaWhere>;
  /** Filter type where none of the related Ideas match this filter */
  none?: InputMaybe<IdeaWhere>;
  /** Filter type where one of the related Ideas match this filter */
  single?: InputMaybe<IdeaWhere>;
  /** Filter type where some of the related Ideas match this filter */
  some?: InputMaybe<IdeaWhere>;
};

/** Fields to sort Ideas by. The order in which sorts are applied is not guaranteed when specifying many fields in one IdeaSort object. */
export type IdeaSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum IdeaStatus {
  Building = 'BUILDING',
  Draft = 'DRAFT',
  Exploring = 'EXPLORING',
  ReadyForBuild = 'READY_FOR_BUILD',
  Shipped = 'SHIPPED',
  Validated = 'VALIDATED'
}

/** IdeaStatus filters */
export type IdeaStatusEnumScalarFilters = {
  eq?: InputMaybe<IdeaStatus>;
  in?: InputMaybe<Array<IdeaStatus>>;
};

/** IdeaStatus mutations */
export type IdeaStatusEnumScalarMutations = {
  set?: InputMaybe<IdeaStatus>;
};

export type IdeaUpdateInput = {
  addresses?: InputMaybe<Array<IdeaAddressesUpdateFieldInput>>;
  assumptions?: InputMaybe<Array<IdeaAssumptionsUpdateFieldInput>>;
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<IdeaStatusEnumScalarMutations>;
};

export type IdeaWhere = {
  AND?: InputMaybe<Array<IdeaWhere>>;
  NOT?: InputMaybe<IdeaWhere>;
  OR?: InputMaybe<Array<IdeaWhere>>;
  addresses?: InputMaybe<OpportunityRelationshipFilters>;
  addressesConnection?: InputMaybe<IdeaAddressesConnectionFilters>;
  assumptions?: InputMaybe<AssumptionRelationshipFilters>;
  assumptionsConnection?: InputMaybe<IdeaAssumptionsConnectionFilters>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<IdeaDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  status?: InputMaybe<IdeaStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type IdeaWithAssumptions = {
  __typename?: 'IdeaWithAssumptions';
  assumptions: Array<AssumptionWithExperiments>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: IdeaStatus;
};

export type IdeasConnection = {
  __typename?: 'IdeasConnection';
  aggregate: IdeaAggregate;
  edges: Array<IdeaEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Initiative = {
  __typename?: 'Initiative';
  body?: Maybe<Scalars['String']['output']>;
  children: Array<Project>;
  childrenConnection: InitiativeChildrenConnection;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: InitiativeDomainConnection;
  fromDiscovery?: Maybe<Idea>;
  fromDiscoveryConnection: InitiativeFromDiscoveryConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: InitiativeStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type InitiativeChildrenArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ProjectSort>>;
  where?: InputMaybe<ProjectWhere>;
};


export type InitiativeChildrenConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<InitiativeChildrenConnectionSort>>;
  where?: InputMaybe<InitiativeChildrenConnectionWhere>;
};

export type InitiativeAggregate = {
  __typename?: 'InitiativeAggregate';
  count: Count;
  node: InitiativeAggregateNode;
};

export type InitiativeAggregateNode = {
  __typename?: 'InitiativeAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type InitiativeChildrenAggregateInput = {
  AND?: InputMaybe<Array<InitiativeChildrenAggregateInput>>;
  NOT?: InputMaybe<InitiativeChildrenAggregateInput>;
  OR?: InputMaybe<Array<InitiativeChildrenAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<InitiativeChildrenNodeAggregationWhereInput>;
};

export type InitiativeChildrenConnectFieldInput = {
  connect?: InputMaybe<Array<ProjectConnectInput>>;
  where?: InputMaybe<ProjectConnectWhere>;
};

export type InitiativeChildrenConnection = {
  __typename?: 'InitiativeChildrenConnection';
  aggregate: InitiativeProjectChildrenAggregateSelection;
  edges: Array<InitiativeChildrenRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type InitiativeChildrenConnectionAggregateInput = {
  AND?: InputMaybe<Array<InitiativeChildrenConnectionAggregateInput>>;
  NOT?: InputMaybe<InitiativeChildrenConnectionAggregateInput>;
  OR?: InputMaybe<Array<InitiativeChildrenConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<InitiativeChildrenNodeAggregationWhereInput>;
};

export type InitiativeChildrenConnectionFilters = {
  /** Filter Initiatives by aggregating results on related InitiativeChildrenConnections */
  aggregate?: InputMaybe<InitiativeChildrenConnectionAggregateInput>;
  /** Return Initiatives where all of the related InitiativeChildrenConnections match this filter */
  all?: InputMaybe<InitiativeChildrenConnectionWhere>;
  /** Return Initiatives where none of the related InitiativeChildrenConnections match this filter */
  none?: InputMaybe<InitiativeChildrenConnectionWhere>;
  /** Return Initiatives where one of the related InitiativeChildrenConnections match this filter */
  single?: InputMaybe<InitiativeChildrenConnectionWhere>;
  /** Return Initiatives where some of the related InitiativeChildrenConnections match this filter */
  some?: InputMaybe<InitiativeChildrenConnectionWhere>;
};

export type InitiativeChildrenConnectionSort = {
  node?: InputMaybe<ProjectSort>;
};

export type InitiativeChildrenConnectionWhere = {
  AND?: InputMaybe<Array<InitiativeChildrenConnectionWhere>>;
  NOT?: InputMaybe<InitiativeChildrenConnectionWhere>;
  OR?: InputMaybe<Array<InitiativeChildrenConnectionWhere>>;
  node?: InputMaybe<ProjectWhere>;
};

export type InitiativeChildrenCreateFieldInput = {
  node: ProjectCreateInput;
};

export type InitiativeChildrenDeleteFieldInput = {
  delete?: InputMaybe<ProjectDeleteInput>;
  where?: InputMaybe<InitiativeChildrenConnectionWhere>;
};

export type InitiativeChildrenDisconnectFieldInput = {
  disconnect?: InputMaybe<ProjectDisconnectInput>;
  where?: InputMaybe<InitiativeChildrenConnectionWhere>;
};

export type InitiativeChildrenFieldInput = {
  connect?: InputMaybe<Array<InitiativeChildrenConnectFieldInput>>;
  create?: InputMaybe<Array<InitiativeChildrenCreateFieldInput>>;
};

export type InitiativeChildrenNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<InitiativeChildrenNodeAggregationWhereInput>>;
  NOT?: InputMaybe<InitiativeChildrenNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<InitiativeChildrenNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type InitiativeChildrenRelationship = {
  __typename?: 'InitiativeChildrenRelationship';
  cursor: Scalars['String']['output'];
  node: Project;
};

export type InitiativeChildrenUpdateConnectionInput = {
  node?: InputMaybe<ProjectUpdateInput>;
  where?: InputMaybe<InitiativeChildrenConnectionWhere>;
};

export type InitiativeChildrenUpdateFieldInput = {
  connect?: InputMaybe<Array<InitiativeChildrenConnectFieldInput>>;
  create?: InputMaybe<Array<InitiativeChildrenCreateFieldInput>>;
  delete?: InputMaybe<Array<InitiativeChildrenDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<InitiativeChildrenDisconnectFieldInput>>;
  update?: InputMaybe<InitiativeChildrenUpdateConnectionInput>;
};

export type InitiativeCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  children?: InputMaybe<InitiativeChildrenFieldInput>;
  domain?: InputMaybe<InitiativeDomainFieldInput>;
  fromDiscovery?: InputMaybe<InitiativeFromDiscoveryFieldInput>;
  name: Scalars['String']['input'];
  status: InitiativeStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type InitiativeDeleteInput = {
  children?: InputMaybe<Array<InitiativeChildrenDeleteFieldInput>>;
  domain?: InputMaybe<InitiativeDomainDeleteFieldInput>;
  fromDiscovery?: InputMaybe<InitiativeFromDiscoveryDeleteFieldInput>;
};

export type InitiativeDomainConnection = {
  __typename?: 'InitiativeDomainConnection';
  edges: Array<InitiativeDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type InitiativeDomainConnectionWhere = {
  AND?: InputMaybe<Array<InitiativeDomainConnectionWhere>>;
  NOT?: InputMaybe<InitiativeDomainConnectionWhere>;
  OR?: InputMaybe<Array<InitiativeDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type InitiativeDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type InitiativeDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<InitiativeDomainConnectionWhere>;
};

export type InitiativeDomainFieldInput = {
  create?: InputMaybe<InitiativeDomainCreateFieldInput>;
};

export type InitiativeDomainRelationship = {
  __typename?: 'InitiativeDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type InitiativeEdge = {
  __typename?: 'InitiativeEdge';
  cursor: Scalars['String']['output'];
  node: Initiative;
};

export type InitiativeFromDiscoveryConnection = {
  __typename?: 'InitiativeFromDiscoveryConnection';
  edges: Array<InitiativeFromDiscoveryRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type InitiativeFromDiscoveryConnectionWhere = {
  AND?: InputMaybe<Array<InitiativeFromDiscoveryConnectionWhere>>;
  NOT?: InputMaybe<InitiativeFromDiscoveryConnectionWhere>;
  OR?: InputMaybe<Array<InitiativeFromDiscoveryConnectionWhere>>;
  node?: InputMaybe<IdeaWhere>;
};

export type InitiativeFromDiscoveryCreateFieldInput = {
  node: IdeaCreateInput;
};

export type InitiativeFromDiscoveryDeleteFieldInput = {
  delete?: InputMaybe<IdeaDeleteInput>;
  where?: InputMaybe<InitiativeFromDiscoveryConnectionWhere>;
};

export type InitiativeFromDiscoveryFieldInput = {
  create?: InputMaybe<InitiativeFromDiscoveryCreateFieldInput>;
};

export type InitiativeFromDiscoveryRelationship = {
  __typename?: 'InitiativeFromDiscoveryRelationship';
  cursor: Scalars['String']['output'];
  node: Idea;
};

export type InitiativeProjectChildrenAggregateSelection = {
  __typename?: 'InitiativeProjectChildrenAggregateSelection';
  count: CountConnection;
  node?: Maybe<InitiativeProjectChildrenNodeAggregateSelection>;
};

export type InitiativeProjectChildrenNodeAggregateSelection = {
  __typename?: 'InitiativeProjectChildrenNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

/** Fields to sort Initiatives by. The order in which sorts are applied is not guaranteed when specifying many fields in one InitiativeSort object. */
export type InitiativeSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum InitiativeStatus {
  Abandoned = 'ABANDONED',
  Active = 'ACTIVE',
  Complete = 'COMPLETE',
  Paused = 'PAUSED',
  Proposed = 'PROPOSED'
}

/** InitiativeStatus filters */
export type InitiativeStatusEnumScalarFilters = {
  eq?: InputMaybe<InitiativeStatus>;
  in?: InputMaybe<Array<InitiativeStatus>>;
};

/** InitiativeStatus mutations */
export type InitiativeStatusEnumScalarMutations = {
  set?: InputMaybe<InitiativeStatus>;
};

export type InitiativeUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  children?: InputMaybe<Array<InitiativeChildrenUpdateFieldInput>>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<InitiativeStatusEnumScalarMutations>;
};

export type InitiativeWhere = {
  AND?: InputMaybe<Array<InitiativeWhere>>;
  NOT?: InputMaybe<InitiativeWhere>;
  OR?: InputMaybe<Array<InitiativeWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  children?: InputMaybe<ProjectRelationshipFilters>;
  childrenConnection?: InputMaybe<InitiativeChildrenConnectionFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<InitiativeDomainConnectionWhere>;
  fromDiscovery?: InputMaybe<IdeaWhere>;
  fromDiscoveryConnection?: InputMaybe<InitiativeFromDiscoveryConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  status?: InputMaybe<InitiativeStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type InitiativesConnection = {
  __typename?: 'InitiativesConnection';
  aggregate: InitiativeAggregate;
  edges: Array<InitiativeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Int filters */
export type IntScalarFilters = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
};

/** Mutations for a list for String */
export type ListStringMutations = {
  pop?: InputMaybe<Scalars['Int']['input']>;
  push?: InputMaybe<Array<Scalars['String']['input']>>;
  set?: InputMaybe<Array<Scalars['String']['input']>>;
};

/**
 * The edge properties for the following fields:
 * * Domain.users
 * * User.domains
 */
export type MemberOfProperties = {
  __typename?: 'MemberOfProperties';
  joinedAt: Scalars['DateTime']['output'];
  role: Scalars['String']['output'];
};

export type MemberOfPropertiesAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberOfPropertiesAggregationWhereInput>>;
  NOT?: InputMaybe<MemberOfPropertiesAggregationWhereInput>;
  OR?: InputMaybe<Array<MemberOfPropertiesAggregationWhereInput>>;
  joinedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  role?: InputMaybe<StringScalarAggregationFilters>;
};

export type MemberOfPropertiesCreateInput = {
  joinedAt: Scalars['DateTime']['input'];
  role: Scalars['String']['input'];
};

export type MemberOfPropertiesSort = {
  joinedAt?: InputMaybe<SortDirection>;
  role?: InputMaybe<SortDirection>;
};

export type MemberOfPropertiesUpdateInput = {
  joinedAt?: InputMaybe<DateTimeScalarMutations>;
  role?: InputMaybe<StringScalarMutations>;
};

export type MemberOfPropertiesWhere = {
  AND?: InputMaybe<Array<MemberOfPropertiesWhere>>;
  NOT?: InputMaybe<MemberOfPropertiesWhere>;
  OR?: InputMaybe<Array<MemberOfPropertiesWhere>>;
  joinedAt?: InputMaybe<DateTimeScalarFilters>;
  role?: InputMaybe<StringScalarFilters>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createAdrs: CreateAdrsMutationResponse;
  createAssumptions: CreateAssumptionsMutationResponse;
  createBugs: CreateBugsMutationResponse;
  createChores: CreateChoresMutationResponse;
  createDevMilestones: CreateDevMilestonesMutationResponse;
  createDevWorkstreams: CreateDevWorkstreamsMutationResponse;
  createDomains: CreateDomainsMutationResponse;
  createEnhancements: CreateEnhancementsMutationResponse;
  createEpics: CreateEpicsMutationResponse;
  createExperiments: CreateExperimentsMutationResponse;
  createIdeas: CreateIdeasMutationResponse;
  createInitiatives: CreateInitiativesMutationResponse;
  createObjectives: CreateObjectivesMutationResponse;
  createOpportunities: CreateOpportunitiesMutationResponse;
  createOrganizations: CreateOrganizationsMutationResponse;
  createProjects: CreateProjectsMutationResponse;
  createSpecs: CreateSpecsMutationResponse;
  createSpikes: CreateSpikesMutationResponse;
  createStories: CreateStoriesMutationResponse;
  createTasks: CreateTasksMutationResponse;
  createUsers: CreateUsersMutationResponse;
  deleteAdrs: DeleteInfo;
  deleteAssumptions: DeleteInfo;
  deleteBugs: DeleteInfo;
  deleteChores: DeleteInfo;
  deleteDevMilestones: DeleteInfo;
  deleteDevWorkstreams: DeleteInfo;
  deleteDomains: DeleteInfo;
  deleteEnhancements: DeleteInfo;
  deleteEpics: DeleteInfo;
  deleteExperiments: DeleteInfo;
  deleteIdeas: DeleteInfo;
  deleteInitiatives: DeleteInfo;
  deleteObjectives: DeleteInfo;
  deleteOpportunities: DeleteInfo;
  deleteOrganizations: DeleteInfo;
  deleteProjects: DeleteInfo;
  deleteSpecs: DeleteInfo;
  deleteSpikes: DeleteInfo;
  deleteStories: DeleteInfo;
  deleteTasks: DeleteInfo;
  deleteUsers: DeleteInfo;
  updateAdrs: UpdateAdrsMutationResponse;
  updateAssumptions: UpdateAssumptionsMutationResponse;
  updateBugs: UpdateBugsMutationResponse;
  updateChores: UpdateChoresMutationResponse;
  updateDevMilestones: UpdateDevMilestonesMutationResponse;
  updateDevWorkstreams: UpdateDevWorkstreamsMutationResponse;
  updateDomains: UpdateDomainsMutationResponse;
  updateEnhancements: UpdateEnhancementsMutationResponse;
  updateEpics: UpdateEpicsMutationResponse;
  updateExperiments: UpdateExperimentsMutationResponse;
  updateIdeas: UpdateIdeasMutationResponse;
  updateInitiatives: UpdateInitiativesMutationResponse;
  updateObjectives: UpdateObjectivesMutationResponse;
  updateOpportunities: UpdateOpportunitiesMutationResponse;
  updateOrganizations: UpdateOrganizationsMutationResponse;
  updateProjects: UpdateProjectsMutationResponse;
  updateSpecs: UpdateSpecsMutationResponse;
  updateSpikes: UpdateSpikesMutationResponse;
  updateStories: UpdateStoriesMutationResponse;
  updateTasks: UpdateTasksMutationResponse;
  updateUsers: UpdateUsersMutationResponse;
};


export type MutationCreateAdrsArgs = {
  input: Array<AdrCreateInput>;
};


export type MutationCreateAssumptionsArgs = {
  input: Array<AssumptionCreateInput>;
};


export type MutationCreateBugsArgs = {
  input: Array<BugCreateInput>;
};


export type MutationCreateChoresArgs = {
  input: Array<ChoreCreateInput>;
};


export type MutationCreateDevMilestonesArgs = {
  input: Array<DevMilestoneCreateInput>;
};


export type MutationCreateDevWorkstreamsArgs = {
  input: Array<DevWorkstreamCreateInput>;
};


export type MutationCreateDomainsArgs = {
  input: Array<DomainCreateInput>;
};


export type MutationCreateEnhancementsArgs = {
  input: Array<EnhancementCreateInput>;
};


export type MutationCreateEpicsArgs = {
  input: Array<EpicCreateInput>;
};


export type MutationCreateExperimentsArgs = {
  input: Array<ExperimentCreateInput>;
};


export type MutationCreateIdeasArgs = {
  input: Array<IdeaCreateInput>;
};


export type MutationCreateInitiativesArgs = {
  input: Array<InitiativeCreateInput>;
};


export type MutationCreateObjectivesArgs = {
  input: Array<ObjectiveCreateInput>;
};


export type MutationCreateOpportunitiesArgs = {
  input: Array<OpportunityCreateInput>;
};


export type MutationCreateOrganizationsArgs = {
  input: Array<OrganizationCreateInput>;
};


export type MutationCreateProjectsArgs = {
  input: Array<ProjectCreateInput>;
};


export type MutationCreateSpecsArgs = {
  input: Array<SpecCreateInput>;
};


export type MutationCreateSpikesArgs = {
  input: Array<SpikeCreateInput>;
};


export type MutationCreateStoriesArgs = {
  input: Array<StoryCreateInput>;
};


export type MutationCreateTasksArgs = {
  input: Array<TaskCreateInput>;
};


export type MutationCreateUsersArgs = {
  input: Array<UserCreateInput>;
};


export type MutationDeleteAdrsArgs = {
  delete?: InputMaybe<AdrDeleteInput>;
  where?: InputMaybe<AdrWhere>;
};


export type MutationDeleteAssumptionsArgs = {
  delete?: InputMaybe<AssumptionDeleteInput>;
  where?: InputMaybe<AssumptionWhere>;
};


export type MutationDeleteBugsArgs = {
  delete?: InputMaybe<BugDeleteInput>;
  where?: InputMaybe<BugWhere>;
};


export type MutationDeleteChoresArgs = {
  delete?: InputMaybe<ChoreDeleteInput>;
  where?: InputMaybe<ChoreWhere>;
};


export type MutationDeleteDevMilestonesArgs = {
  delete?: InputMaybe<DevMilestoneDeleteInput>;
  where?: InputMaybe<DevMilestoneWhere>;
};


export type MutationDeleteDevWorkstreamsArgs = {
  delete?: InputMaybe<DevWorkstreamDeleteInput>;
  where?: InputMaybe<DevWorkstreamWhere>;
};


export type MutationDeleteDomainsArgs = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<DomainWhere>;
};


export type MutationDeleteEnhancementsArgs = {
  delete?: InputMaybe<EnhancementDeleteInput>;
  where?: InputMaybe<EnhancementWhere>;
};


export type MutationDeleteEpicsArgs = {
  delete?: InputMaybe<EpicDeleteInput>;
  where?: InputMaybe<EpicWhere>;
};


export type MutationDeleteExperimentsArgs = {
  delete?: InputMaybe<ExperimentDeleteInput>;
  where?: InputMaybe<ExperimentWhere>;
};


export type MutationDeleteIdeasArgs = {
  delete?: InputMaybe<IdeaDeleteInput>;
  where?: InputMaybe<IdeaWhere>;
};


export type MutationDeleteInitiativesArgs = {
  delete?: InputMaybe<InitiativeDeleteInput>;
  where?: InputMaybe<InitiativeWhere>;
};


export type MutationDeleteObjectivesArgs = {
  delete?: InputMaybe<ObjectiveDeleteInput>;
  where?: InputMaybe<ObjectiveWhere>;
};


export type MutationDeleteOpportunitiesArgs = {
  delete?: InputMaybe<OpportunityDeleteInput>;
  where?: InputMaybe<OpportunityWhere>;
};


export type MutationDeleteOrganizationsArgs = {
  delete?: InputMaybe<OrganizationDeleteInput>;
  where?: InputMaybe<OrganizationWhere>;
};


export type MutationDeleteProjectsArgs = {
  delete?: InputMaybe<ProjectDeleteInput>;
  where?: InputMaybe<ProjectWhere>;
};


export type MutationDeleteSpecsArgs = {
  delete?: InputMaybe<SpecDeleteInput>;
  where?: InputMaybe<SpecWhere>;
};


export type MutationDeleteSpikesArgs = {
  delete?: InputMaybe<SpikeDeleteInput>;
  where?: InputMaybe<SpikeWhere>;
};


export type MutationDeleteStoriesArgs = {
  delete?: InputMaybe<StoryDeleteInput>;
  where?: InputMaybe<StoryWhere>;
};


export type MutationDeleteTasksArgs = {
  delete?: InputMaybe<TaskDeleteInput>;
  where?: InputMaybe<TaskWhere>;
};


export type MutationDeleteUsersArgs = {
  delete?: InputMaybe<UserDeleteInput>;
  where?: InputMaybe<UserWhere>;
};


export type MutationUpdateAdrsArgs = {
  update?: InputMaybe<AdrUpdateInput>;
  where?: InputMaybe<AdrWhere>;
};


export type MutationUpdateAssumptionsArgs = {
  update?: InputMaybe<AssumptionUpdateInput>;
  where?: InputMaybe<AssumptionWhere>;
};


export type MutationUpdateBugsArgs = {
  update?: InputMaybe<BugUpdateInput>;
  where?: InputMaybe<BugWhere>;
};


export type MutationUpdateChoresArgs = {
  update?: InputMaybe<ChoreUpdateInput>;
  where?: InputMaybe<ChoreWhere>;
};


export type MutationUpdateDevMilestonesArgs = {
  update?: InputMaybe<DevMilestoneUpdateInput>;
  where?: InputMaybe<DevMilestoneWhere>;
};


export type MutationUpdateDevWorkstreamsArgs = {
  update?: InputMaybe<DevWorkstreamUpdateInput>;
  where?: InputMaybe<DevWorkstreamWhere>;
};


export type MutationUpdateDomainsArgs = {
  update?: InputMaybe<DomainUpdateInput>;
  where?: InputMaybe<DomainWhere>;
};


export type MutationUpdateEnhancementsArgs = {
  update?: InputMaybe<EnhancementUpdateInput>;
  where?: InputMaybe<EnhancementWhere>;
};


export type MutationUpdateEpicsArgs = {
  update?: InputMaybe<EpicUpdateInput>;
  where?: InputMaybe<EpicWhere>;
};


export type MutationUpdateExperimentsArgs = {
  update?: InputMaybe<ExperimentUpdateInput>;
  where?: InputMaybe<ExperimentWhere>;
};


export type MutationUpdateIdeasArgs = {
  update?: InputMaybe<IdeaUpdateInput>;
  where?: InputMaybe<IdeaWhere>;
};


export type MutationUpdateInitiativesArgs = {
  update?: InputMaybe<InitiativeUpdateInput>;
  where?: InputMaybe<InitiativeWhere>;
};


export type MutationUpdateObjectivesArgs = {
  update?: InputMaybe<ObjectiveUpdateInput>;
  where?: InputMaybe<ObjectiveWhere>;
};


export type MutationUpdateOpportunitiesArgs = {
  update?: InputMaybe<OpportunityUpdateInput>;
  where?: InputMaybe<OpportunityWhere>;
};


export type MutationUpdateOrganizationsArgs = {
  update?: InputMaybe<OrganizationUpdateInput>;
  where?: InputMaybe<OrganizationWhere>;
};


export type MutationUpdateProjectsArgs = {
  update?: InputMaybe<ProjectUpdateInput>;
  where?: InputMaybe<ProjectWhere>;
};


export type MutationUpdateSpecsArgs = {
  update?: InputMaybe<SpecUpdateInput>;
  where?: InputMaybe<SpecWhere>;
};


export type MutationUpdateSpikesArgs = {
  update?: InputMaybe<SpikeUpdateInput>;
  where?: InputMaybe<SpikeWhere>;
};


export type MutationUpdateStoriesArgs = {
  update?: InputMaybe<StoryUpdateInput>;
  where?: InputMaybe<StoryWhere>;
};


export type MutationUpdateTasksArgs = {
  update?: InputMaybe<TaskUpdateInput>;
  where?: InputMaybe<TaskWhere>;
};


export type MutationUpdateUsersArgs = {
  update?: InputMaybe<UserUpdateInput>;
  where?: InputMaybe<UserWhere>;
};

export type Objective = {
  __typename?: 'Objective';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: ObjectiveDomainConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: ObjectiveStatus;
  supportedBy: Array<Opportunity>;
  supportedByConnection: ObjectiveSupportedByConnection;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type ObjectiveSupportedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<OpportunitySort>>;
  where?: InputMaybe<OpportunityWhere>;
};


export type ObjectiveSupportedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ObjectiveSupportedByConnectionSort>>;
  where?: InputMaybe<ObjectiveSupportedByConnectionWhere>;
};

export type ObjectiveAggregate = {
  __typename?: 'ObjectiveAggregate';
  count: Count;
  node: ObjectiveAggregateNode;
};

export type ObjectiveAggregateNode = {
  __typename?: 'ObjectiveAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type ObjectiveConnectInput = {
  supportedBy?: InputMaybe<Array<ObjectiveSupportedByConnectFieldInput>>;
};

export type ObjectiveConnectWhere = {
  node: ObjectiveWhere;
};

export type ObjectiveCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<ObjectiveDomainFieldInput>;
  name: Scalars['String']['input'];
  status: ObjectiveStatus;
  supportedBy?: InputMaybe<ObjectiveSupportedByFieldInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type ObjectiveDeleteInput = {
  domain?: InputMaybe<ObjectiveDomainDeleteFieldInput>;
  supportedBy?: InputMaybe<Array<ObjectiveSupportedByDeleteFieldInput>>;
};

export type ObjectiveDisconnectInput = {
  supportedBy?: InputMaybe<Array<ObjectiveSupportedByDisconnectFieldInput>>;
};

export type ObjectiveDomainConnection = {
  __typename?: 'ObjectiveDomainConnection';
  edges: Array<ObjectiveDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ObjectiveDomainConnectionWhere = {
  AND?: InputMaybe<Array<ObjectiveDomainConnectionWhere>>;
  NOT?: InputMaybe<ObjectiveDomainConnectionWhere>;
  OR?: InputMaybe<Array<ObjectiveDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type ObjectiveDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type ObjectiveDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<ObjectiveDomainConnectionWhere>;
};

export type ObjectiveDomainFieldInput = {
  create?: InputMaybe<ObjectiveDomainCreateFieldInput>;
};

export type ObjectiveDomainRelationship = {
  __typename?: 'ObjectiveDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type ObjectiveEdge = {
  __typename?: 'ObjectiveEdge';
  cursor: Scalars['String']['output'];
  node: Objective;
};

export type ObjectiveOpportunitySupportedByAggregateSelection = {
  __typename?: 'ObjectiveOpportunitySupportedByAggregateSelection';
  count: CountConnection;
  node?: Maybe<ObjectiveOpportunitySupportedByNodeAggregateSelection>;
};

export type ObjectiveOpportunitySupportedByNodeAggregateSelection = {
  __typename?: 'ObjectiveOpportunitySupportedByNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  hmw: StringAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type ObjectiveRelationshipFilters = {
  /** Filter type where all of the related Objectives match this filter */
  all?: InputMaybe<ObjectiveWhere>;
  /** Filter type where none of the related Objectives match this filter */
  none?: InputMaybe<ObjectiveWhere>;
  /** Filter type where one of the related Objectives match this filter */
  single?: InputMaybe<ObjectiveWhere>;
  /** Filter type where some of the related Objectives match this filter */
  some?: InputMaybe<ObjectiveWhere>;
};

/** Fields to sort Objectives by. The order in which sorts are applied is not guaranteed when specifying many fields in one ObjectiveSort object. */
export type ObjectiveSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum ObjectiveStatus {
  Abandoned = 'ABANDONED',
  Achieved = 'ACHIEVED',
  Active = 'ACTIVE',
  Paused = 'PAUSED'
}

/** ObjectiveStatus filters */
export type ObjectiveStatusEnumScalarFilters = {
  eq?: InputMaybe<ObjectiveStatus>;
  in?: InputMaybe<Array<ObjectiveStatus>>;
};

/** ObjectiveStatus mutations */
export type ObjectiveStatusEnumScalarMutations = {
  set?: InputMaybe<ObjectiveStatus>;
};

export type ObjectiveSubgraphResult = {
  __typename?: 'ObjectiveSubgraphResult';
  body?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  opportunities: Array<OpportunityWithIdeas>;
  status: ObjectiveStatus;
};

export type ObjectiveSupportedByAggregateInput = {
  AND?: InputMaybe<Array<ObjectiveSupportedByAggregateInput>>;
  NOT?: InputMaybe<ObjectiveSupportedByAggregateInput>;
  OR?: InputMaybe<Array<ObjectiveSupportedByAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<ObjectiveSupportedByNodeAggregationWhereInput>;
};

export type ObjectiveSupportedByConnectFieldInput = {
  connect?: InputMaybe<Array<OpportunityConnectInput>>;
  where?: InputMaybe<OpportunityConnectWhere>;
};

export type ObjectiveSupportedByConnection = {
  __typename?: 'ObjectiveSupportedByConnection';
  aggregate: ObjectiveOpportunitySupportedByAggregateSelection;
  edges: Array<ObjectiveSupportedByRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ObjectiveSupportedByConnectionAggregateInput = {
  AND?: InputMaybe<Array<ObjectiveSupportedByConnectionAggregateInput>>;
  NOT?: InputMaybe<ObjectiveSupportedByConnectionAggregateInput>;
  OR?: InputMaybe<Array<ObjectiveSupportedByConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<ObjectiveSupportedByNodeAggregationWhereInput>;
};

export type ObjectiveSupportedByConnectionFilters = {
  /** Filter Objectives by aggregating results on related ObjectiveSupportedByConnections */
  aggregate?: InputMaybe<ObjectiveSupportedByConnectionAggregateInput>;
  /** Return Objectives where all of the related ObjectiveSupportedByConnections match this filter */
  all?: InputMaybe<ObjectiveSupportedByConnectionWhere>;
  /** Return Objectives where none of the related ObjectiveSupportedByConnections match this filter */
  none?: InputMaybe<ObjectiveSupportedByConnectionWhere>;
  /** Return Objectives where one of the related ObjectiveSupportedByConnections match this filter */
  single?: InputMaybe<ObjectiveSupportedByConnectionWhere>;
  /** Return Objectives where some of the related ObjectiveSupportedByConnections match this filter */
  some?: InputMaybe<ObjectiveSupportedByConnectionWhere>;
};

export type ObjectiveSupportedByConnectionSort = {
  node?: InputMaybe<OpportunitySort>;
};

export type ObjectiveSupportedByConnectionWhere = {
  AND?: InputMaybe<Array<ObjectiveSupportedByConnectionWhere>>;
  NOT?: InputMaybe<ObjectiveSupportedByConnectionWhere>;
  OR?: InputMaybe<Array<ObjectiveSupportedByConnectionWhere>>;
  node?: InputMaybe<OpportunityWhere>;
};

export type ObjectiveSupportedByCreateFieldInput = {
  node: OpportunityCreateInput;
};

export type ObjectiveSupportedByDeleteFieldInput = {
  delete?: InputMaybe<OpportunityDeleteInput>;
  where?: InputMaybe<ObjectiveSupportedByConnectionWhere>;
};

export type ObjectiveSupportedByDisconnectFieldInput = {
  disconnect?: InputMaybe<OpportunityDisconnectInput>;
  where?: InputMaybe<ObjectiveSupportedByConnectionWhere>;
};

export type ObjectiveSupportedByFieldInput = {
  connect?: InputMaybe<Array<ObjectiveSupportedByConnectFieldInput>>;
  create?: InputMaybe<Array<ObjectiveSupportedByCreateFieldInput>>;
};

export type ObjectiveSupportedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ObjectiveSupportedByNodeAggregationWhereInput>>;
  NOT?: InputMaybe<ObjectiveSupportedByNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<ObjectiveSupportedByNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  hmw?: InputMaybe<StringScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type ObjectiveSupportedByRelationship = {
  __typename?: 'ObjectiveSupportedByRelationship';
  cursor: Scalars['String']['output'];
  node: Opportunity;
};

export type ObjectiveSupportedByUpdateConnectionInput = {
  node?: InputMaybe<OpportunityUpdateInput>;
  where?: InputMaybe<ObjectiveSupportedByConnectionWhere>;
};

export type ObjectiveSupportedByUpdateFieldInput = {
  connect?: InputMaybe<Array<ObjectiveSupportedByConnectFieldInput>>;
  create?: InputMaybe<Array<ObjectiveSupportedByCreateFieldInput>>;
  delete?: InputMaybe<Array<ObjectiveSupportedByDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<ObjectiveSupportedByDisconnectFieldInput>>;
  update?: InputMaybe<ObjectiveSupportedByUpdateConnectionInput>;
};

export type ObjectiveUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<ObjectiveStatusEnumScalarMutations>;
  supportedBy?: InputMaybe<Array<ObjectiveSupportedByUpdateFieldInput>>;
};

export type ObjectiveWhere = {
  AND?: InputMaybe<Array<ObjectiveWhere>>;
  NOT?: InputMaybe<ObjectiveWhere>;
  OR?: InputMaybe<Array<ObjectiveWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<ObjectiveDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  status?: InputMaybe<ObjectiveStatusEnumScalarFilters>;
  supportedBy?: InputMaybe<OpportunityRelationshipFilters>;
  supportedByConnection?: InputMaybe<ObjectiveSupportedByConnectionFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type ObjectivesConnection = {
  __typename?: 'ObjectivesConnection';
  aggregate: ObjectiveAggregate;
  edges: Array<ObjectiveEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type OpportunitiesConnection = {
  __typename?: 'OpportunitiesConnection';
  aggregate: OpportunityAggregate;
  edges: Array<OpportunityEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Opportunity = {
  __typename?: 'Opportunity';
  addressedBy: Array<Idea>;
  addressedByConnection: OpportunityAddressedByConnection;
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: OpportunityDomainConnection;
  hmw?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: OpportunityStatus;
  supports: Array<Objective>;
  supportsConnection: OpportunitySupportsConnection;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type OpportunityAddressedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<IdeaSort>>;
  where?: InputMaybe<IdeaWhere>;
};


export type OpportunityAddressedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<OpportunityAddressedByConnectionSort>>;
  where?: InputMaybe<OpportunityAddressedByConnectionWhere>;
};


export type OpportunitySupportsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ObjectiveSort>>;
  where?: InputMaybe<ObjectiveWhere>;
};


export type OpportunitySupportsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<OpportunitySupportsConnectionSort>>;
  where?: InputMaybe<OpportunitySupportsConnectionWhere>;
};

export type OpportunityAddressedByAggregateInput = {
  AND?: InputMaybe<Array<OpportunityAddressedByAggregateInput>>;
  NOT?: InputMaybe<OpportunityAddressedByAggregateInput>;
  OR?: InputMaybe<Array<OpportunityAddressedByAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<OpportunityAddressedByNodeAggregationWhereInput>;
};

export type OpportunityAddressedByConnectFieldInput = {
  connect?: InputMaybe<Array<IdeaConnectInput>>;
  where?: InputMaybe<IdeaConnectWhere>;
};

export type OpportunityAddressedByConnection = {
  __typename?: 'OpportunityAddressedByConnection';
  aggregate: OpportunityIdeaAddressedByAggregateSelection;
  edges: Array<OpportunityAddressedByRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type OpportunityAddressedByConnectionAggregateInput = {
  AND?: InputMaybe<Array<OpportunityAddressedByConnectionAggregateInput>>;
  NOT?: InputMaybe<OpportunityAddressedByConnectionAggregateInput>;
  OR?: InputMaybe<Array<OpportunityAddressedByConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<OpportunityAddressedByNodeAggregationWhereInput>;
};

export type OpportunityAddressedByConnectionFilters = {
  /** Filter Opportunities by aggregating results on related OpportunityAddressedByConnections */
  aggregate?: InputMaybe<OpportunityAddressedByConnectionAggregateInput>;
  /** Return Opportunities where all of the related OpportunityAddressedByConnections match this filter */
  all?: InputMaybe<OpportunityAddressedByConnectionWhere>;
  /** Return Opportunities where none of the related OpportunityAddressedByConnections match this filter */
  none?: InputMaybe<OpportunityAddressedByConnectionWhere>;
  /** Return Opportunities where one of the related OpportunityAddressedByConnections match this filter */
  single?: InputMaybe<OpportunityAddressedByConnectionWhere>;
  /** Return Opportunities where some of the related OpportunityAddressedByConnections match this filter */
  some?: InputMaybe<OpportunityAddressedByConnectionWhere>;
};

export type OpportunityAddressedByConnectionSort = {
  node?: InputMaybe<IdeaSort>;
};

export type OpportunityAddressedByConnectionWhere = {
  AND?: InputMaybe<Array<OpportunityAddressedByConnectionWhere>>;
  NOT?: InputMaybe<OpportunityAddressedByConnectionWhere>;
  OR?: InputMaybe<Array<OpportunityAddressedByConnectionWhere>>;
  node?: InputMaybe<IdeaWhere>;
};

export type OpportunityAddressedByCreateFieldInput = {
  node: IdeaCreateInput;
};

export type OpportunityAddressedByDeleteFieldInput = {
  delete?: InputMaybe<IdeaDeleteInput>;
  where?: InputMaybe<OpportunityAddressedByConnectionWhere>;
};

export type OpportunityAddressedByDisconnectFieldInput = {
  disconnect?: InputMaybe<IdeaDisconnectInput>;
  where?: InputMaybe<OpportunityAddressedByConnectionWhere>;
};

export type OpportunityAddressedByFieldInput = {
  connect?: InputMaybe<Array<OpportunityAddressedByConnectFieldInput>>;
  create?: InputMaybe<Array<OpportunityAddressedByCreateFieldInput>>;
};

export type OpportunityAddressedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<OpportunityAddressedByNodeAggregationWhereInput>>;
  NOT?: InputMaybe<OpportunityAddressedByNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<OpportunityAddressedByNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type OpportunityAddressedByRelationship = {
  __typename?: 'OpportunityAddressedByRelationship';
  cursor: Scalars['String']['output'];
  node: Idea;
};

export type OpportunityAddressedByUpdateConnectionInput = {
  node?: InputMaybe<IdeaUpdateInput>;
  where?: InputMaybe<OpportunityAddressedByConnectionWhere>;
};

export type OpportunityAddressedByUpdateFieldInput = {
  connect?: InputMaybe<Array<OpportunityAddressedByConnectFieldInput>>;
  create?: InputMaybe<Array<OpportunityAddressedByCreateFieldInput>>;
  delete?: InputMaybe<Array<OpportunityAddressedByDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<OpportunityAddressedByDisconnectFieldInput>>;
  update?: InputMaybe<OpportunityAddressedByUpdateConnectionInput>;
};

export type OpportunityAggregate = {
  __typename?: 'OpportunityAggregate';
  count: Count;
  node: OpportunityAggregateNode;
};

export type OpportunityAggregateNode = {
  __typename?: 'OpportunityAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  hmw: StringAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type OpportunityConnectInput = {
  addressedBy?: InputMaybe<Array<OpportunityAddressedByConnectFieldInput>>;
  supports?: InputMaybe<Array<OpportunitySupportsConnectFieldInput>>;
};

export type OpportunityConnectWhere = {
  node: OpportunityWhere;
};

export type OpportunityCreateInput = {
  addressedBy?: InputMaybe<OpportunityAddressedByFieldInput>;
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<OpportunityDomainFieldInput>;
  hmw?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  status: OpportunityStatus;
  supports?: InputMaybe<OpportunitySupportsFieldInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type OpportunityDeleteInput = {
  addressedBy?: InputMaybe<Array<OpportunityAddressedByDeleteFieldInput>>;
  domain?: InputMaybe<OpportunityDomainDeleteFieldInput>;
  supports?: InputMaybe<Array<OpportunitySupportsDeleteFieldInput>>;
};

export type OpportunityDisconnectInput = {
  addressedBy?: InputMaybe<Array<OpportunityAddressedByDisconnectFieldInput>>;
  supports?: InputMaybe<Array<OpportunitySupportsDisconnectFieldInput>>;
};

export type OpportunityDomainConnection = {
  __typename?: 'OpportunityDomainConnection';
  edges: Array<OpportunityDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type OpportunityDomainConnectionWhere = {
  AND?: InputMaybe<Array<OpportunityDomainConnectionWhere>>;
  NOT?: InputMaybe<OpportunityDomainConnectionWhere>;
  OR?: InputMaybe<Array<OpportunityDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type OpportunityDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type OpportunityDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<OpportunityDomainConnectionWhere>;
};

export type OpportunityDomainFieldInput = {
  create?: InputMaybe<OpportunityDomainCreateFieldInput>;
};

export type OpportunityDomainRelationship = {
  __typename?: 'OpportunityDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type OpportunityEdge = {
  __typename?: 'OpportunityEdge';
  cursor: Scalars['String']['output'];
  node: Opportunity;
};

export type OpportunityIdeaAddressedByAggregateSelection = {
  __typename?: 'OpportunityIdeaAddressedByAggregateSelection';
  count: CountConnection;
  node?: Maybe<OpportunityIdeaAddressedByNodeAggregateSelection>;
};

export type OpportunityIdeaAddressedByNodeAggregateSelection = {
  __typename?: 'OpportunityIdeaAddressedByNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type OpportunityObjectiveSupportsAggregateSelection = {
  __typename?: 'OpportunityObjectiveSupportsAggregateSelection';
  count: CountConnection;
  node?: Maybe<OpportunityObjectiveSupportsNodeAggregateSelection>;
};

export type OpportunityObjectiveSupportsNodeAggregateSelection = {
  __typename?: 'OpportunityObjectiveSupportsNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type OpportunityRelationshipFilters = {
  /** Filter type where all of the related Opportunities match this filter */
  all?: InputMaybe<OpportunityWhere>;
  /** Filter type where none of the related Opportunities match this filter */
  none?: InputMaybe<OpportunityWhere>;
  /** Filter type where one of the related Opportunities match this filter */
  single?: InputMaybe<OpportunityWhere>;
  /** Filter type where some of the related Opportunities match this filter */
  some?: InputMaybe<OpportunityWhere>;
};

/** Fields to sort Opportunities by. The order in which sorts are applied is not guaranteed when specifying many fields in one OpportunitySort object. */
export type OpportunitySort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  hmw?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum OpportunityStatus {
  Abandoned = 'ABANDONED',
  Active = 'ACTIVE',
  Paused = 'PAUSED',
  Resolved = 'RESOLVED'
}

/** OpportunityStatus filters */
export type OpportunityStatusEnumScalarFilters = {
  eq?: InputMaybe<OpportunityStatus>;
  in?: InputMaybe<Array<OpportunityStatus>>;
};

/** OpportunityStatus mutations */
export type OpportunityStatusEnumScalarMutations = {
  set?: InputMaybe<OpportunityStatus>;
};

export type OpportunitySubgraph = {
  __typename?: 'OpportunitySubgraph';
  hmw?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ideas: Array<IdeaWithAssumptions>;
  name: Scalars['String']['output'];
  status: OpportunityStatus;
};

export type OpportunitySupportsAggregateInput = {
  AND?: InputMaybe<Array<OpportunitySupportsAggregateInput>>;
  NOT?: InputMaybe<OpportunitySupportsAggregateInput>;
  OR?: InputMaybe<Array<OpportunitySupportsAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<OpportunitySupportsNodeAggregationWhereInput>;
};

export type OpportunitySupportsConnectFieldInput = {
  connect?: InputMaybe<Array<ObjectiveConnectInput>>;
  where?: InputMaybe<ObjectiveConnectWhere>;
};

export type OpportunitySupportsConnection = {
  __typename?: 'OpportunitySupportsConnection';
  aggregate: OpportunityObjectiveSupportsAggregateSelection;
  edges: Array<OpportunitySupportsRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type OpportunitySupportsConnectionAggregateInput = {
  AND?: InputMaybe<Array<OpportunitySupportsConnectionAggregateInput>>;
  NOT?: InputMaybe<OpportunitySupportsConnectionAggregateInput>;
  OR?: InputMaybe<Array<OpportunitySupportsConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<OpportunitySupportsNodeAggregationWhereInput>;
};

export type OpportunitySupportsConnectionFilters = {
  /** Filter Opportunities by aggregating results on related OpportunitySupportsConnections */
  aggregate?: InputMaybe<OpportunitySupportsConnectionAggregateInput>;
  /** Return Opportunities where all of the related OpportunitySupportsConnections match this filter */
  all?: InputMaybe<OpportunitySupportsConnectionWhere>;
  /** Return Opportunities where none of the related OpportunitySupportsConnections match this filter */
  none?: InputMaybe<OpportunitySupportsConnectionWhere>;
  /** Return Opportunities where one of the related OpportunitySupportsConnections match this filter */
  single?: InputMaybe<OpportunitySupportsConnectionWhere>;
  /** Return Opportunities where some of the related OpportunitySupportsConnections match this filter */
  some?: InputMaybe<OpportunitySupportsConnectionWhere>;
};

export type OpportunitySupportsConnectionSort = {
  node?: InputMaybe<ObjectiveSort>;
};

export type OpportunitySupportsConnectionWhere = {
  AND?: InputMaybe<Array<OpportunitySupportsConnectionWhere>>;
  NOT?: InputMaybe<OpportunitySupportsConnectionWhere>;
  OR?: InputMaybe<Array<OpportunitySupportsConnectionWhere>>;
  node?: InputMaybe<ObjectiveWhere>;
};

export type OpportunitySupportsCreateFieldInput = {
  node: ObjectiveCreateInput;
};

export type OpportunitySupportsDeleteFieldInput = {
  delete?: InputMaybe<ObjectiveDeleteInput>;
  where?: InputMaybe<OpportunitySupportsConnectionWhere>;
};

export type OpportunitySupportsDisconnectFieldInput = {
  disconnect?: InputMaybe<ObjectiveDisconnectInput>;
  where?: InputMaybe<OpportunitySupportsConnectionWhere>;
};

export type OpportunitySupportsFieldInput = {
  connect?: InputMaybe<Array<OpportunitySupportsConnectFieldInput>>;
  create?: InputMaybe<Array<OpportunitySupportsCreateFieldInput>>;
};

export type OpportunitySupportsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<OpportunitySupportsNodeAggregationWhereInput>>;
  NOT?: InputMaybe<OpportunitySupportsNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<OpportunitySupportsNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type OpportunitySupportsRelationship = {
  __typename?: 'OpportunitySupportsRelationship';
  cursor: Scalars['String']['output'];
  node: Objective;
};

export type OpportunitySupportsUpdateConnectionInput = {
  node?: InputMaybe<ObjectiveUpdateInput>;
  where?: InputMaybe<OpportunitySupportsConnectionWhere>;
};

export type OpportunitySupportsUpdateFieldInput = {
  connect?: InputMaybe<Array<OpportunitySupportsConnectFieldInput>>;
  create?: InputMaybe<Array<OpportunitySupportsCreateFieldInput>>;
  delete?: InputMaybe<Array<OpportunitySupportsDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<OpportunitySupportsDisconnectFieldInput>>;
  update?: InputMaybe<OpportunitySupportsUpdateConnectionInput>;
};

export type OpportunityUpdateInput = {
  addressedBy?: InputMaybe<Array<OpportunityAddressedByUpdateFieldInput>>;
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  hmw?: InputMaybe<StringScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<OpportunityStatusEnumScalarMutations>;
  supports?: InputMaybe<Array<OpportunitySupportsUpdateFieldInput>>;
};

export type OpportunityWhere = {
  AND?: InputMaybe<Array<OpportunityWhere>>;
  NOT?: InputMaybe<OpportunityWhere>;
  OR?: InputMaybe<Array<OpportunityWhere>>;
  addressedBy?: InputMaybe<IdeaRelationshipFilters>;
  addressedByConnection?: InputMaybe<OpportunityAddressedByConnectionFilters>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<OpportunityDomainConnectionWhere>;
  hmw?: InputMaybe<StringScalarFilters>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  status?: InputMaybe<OpportunityStatusEnumScalarFilters>;
  supports?: InputMaybe<ObjectiveRelationshipFilters>;
  supportsConnection?: InputMaybe<OpportunitySupportsConnectionFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type OpportunityWithIdeas = {
  __typename?: 'OpportunityWithIdeas';
  hmw?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ideas: Array<IdeaWithAssumptions>;
  name: Scalars['String']['output'];
  status: OpportunityStatus;
};

export type Organization = {
  __typename?: 'Organization';
  createdAt: Scalars['DateTime']['output'];
  domains: Array<Domain>;
  domainsConnection: OrganizationDomainsConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type OrganizationDomainsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DomainSort>>;
  where?: InputMaybe<DomainWhere>;
};


export type OrganizationDomainsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<OrganizationDomainsConnectionSort>>;
  where?: InputMaybe<OrganizationDomainsConnectionWhere>;
};

export type OrganizationAggregate = {
  __typename?: 'OrganizationAggregate';
  count: Count;
  node: OrganizationAggregateNode;
};

export type OrganizationAggregateNode = {
  __typename?: 'OrganizationAggregateNode';
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  slug: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type OrganizationCreateInput = {
  domains?: InputMaybe<OrganizationDomainsFieldInput>;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type OrganizationDeleteInput = {
  domains?: InputMaybe<Array<OrganizationDomainsDeleteFieldInput>>;
};

export type OrganizationDomainDomainsAggregateSelection = {
  __typename?: 'OrganizationDomainDomainsAggregateSelection';
  count: CountConnection;
  node?: Maybe<OrganizationDomainDomainsNodeAggregateSelection>;
};

export type OrganizationDomainDomainsNodeAggregateSelection = {
  __typename?: 'OrganizationDomainDomainsNodeAggregateSelection';
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  slug: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type OrganizationDomainsAggregateInput = {
  AND?: InputMaybe<Array<OrganizationDomainsAggregateInput>>;
  NOT?: InputMaybe<OrganizationDomainsAggregateInput>;
  OR?: InputMaybe<Array<OrganizationDomainsAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<OrganizationDomainsNodeAggregationWhereInput>;
};

export type OrganizationDomainsConnectFieldInput = {
  connect?: InputMaybe<Array<DomainConnectInput>>;
  where?: InputMaybe<DomainConnectWhere>;
};

export type OrganizationDomainsConnection = {
  __typename?: 'OrganizationDomainsConnection';
  aggregate: OrganizationDomainDomainsAggregateSelection;
  edges: Array<OrganizationDomainsRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type OrganizationDomainsConnectionAggregateInput = {
  AND?: InputMaybe<Array<OrganizationDomainsConnectionAggregateInput>>;
  NOT?: InputMaybe<OrganizationDomainsConnectionAggregateInput>;
  OR?: InputMaybe<Array<OrganizationDomainsConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<OrganizationDomainsNodeAggregationWhereInput>;
};

export type OrganizationDomainsConnectionFilters = {
  /** Filter Organizations by aggregating results on related OrganizationDomainsConnections */
  aggregate?: InputMaybe<OrganizationDomainsConnectionAggregateInput>;
  /** Return Organizations where all of the related OrganizationDomainsConnections match this filter */
  all?: InputMaybe<OrganizationDomainsConnectionWhere>;
  /** Return Organizations where none of the related OrganizationDomainsConnections match this filter */
  none?: InputMaybe<OrganizationDomainsConnectionWhere>;
  /** Return Organizations where one of the related OrganizationDomainsConnections match this filter */
  single?: InputMaybe<OrganizationDomainsConnectionWhere>;
  /** Return Organizations where some of the related OrganizationDomainsConnections match this filter */
  some?: InputMaybe<OrganizationDomainsConnectionWhere>;
};

export type OrganizationDomainsConnectionSort = {
  node?: InputMaybe<DomainSort>;
};

export type OrganizationDomainsConnectionWhere = {
  AND?: InputMaybe<Array<OrganizationDomainsConnectionWhere>>;
  NOT?: InputMaybe<OrganizationDomainsConnectionWhere>;
  OR?: InputMaybe<Array<OrganizationDomainsConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type OrganizationDomainsCreateFieldInput = {
  node: DomainCreateInput;
};

export type OrganizationDomainsDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<OrganizationDomainsConnectionWhere>;
};

export type OrganizationDomainsDisconnectFieldInput = {
  disconnect?: InputMaybe<DomainDisconnectInput>;
  where?: InputMaybe<OrganizationDomainsConnectionWhere>;
};

export type OrganizationDomainsFieldInput = {
  connect?: InputMaybe<Array<OrganizationDomainsConnectFieldInput>>;
  create?: InputMaybe<Array<OrganizationDomainsCreateFieldInput>>;
};

export type OrganizationDomainsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<OrganizationDomainsNodeAggregationWhereInput>>;
  NOT?: InputMaybe<OrganizationDomainsNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<OrganizationDomainsNodeAggregationWhereInput>>;
  apiKey?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  slug?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type OrganizationDomainsRelationship = {
  __typename?: 'OrganizationDomainsRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type OrganizationDomainsUpdateConnectionInput = {
  node?: InputMaybe<DomainUpdateInput>;
  where?: InputMaybe<OrganizationDomainsConnectionWhere>;
};

export type OrganizationDomainsUpdateFieldInput = {
  connect?: InputMaybe<Array<OrganizationDomainsConnectFieldInput>>;
  create?: InputMaybe<Array<OrganizationDomainsCreateFieldInput>>;
  delete?: InputMaybe<Array<OrganizationDomainsDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<OrganizationDomainsDisconnectFieldInput>>;
  update?: InputMaybe<OrganizationDomainsUpdateConnectionInput>;
};

export type OrganizationEdge = {
  __typename?: 'OrganizationEdge';
  cursor: Scalars['String']['output'];
  node: Organization;
};

/** Fields to sort Organizations by. The order in which sorts are applied is not guaranteed when specifying many fields in one OrganizationSort object. */
export type OrganizationSort = {
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  slug?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export type OrganizationUpdateInput = {
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  domains?: InputMaybe<Array<OrganizationDomainsUpdateFieldInput>>;
  name?: InputMaybe<StringScalarMutations>;
  slug?: InputMaybe<StringScalarMutations>;
};

export type OrganizationWhere = {
  AND?: InputMaybe<Array<OrganizationWhere>>;
  NOT?: InputMaybe<OrganizationWhere>;
  OR?: InputMaybe<Array<OrganizationWhere>>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domains?: InputMaybe<DomainRelationshipFilters>;
  domainsConnection?: InputMaybe<OrganizationDomainsConnectionFilters>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  slug?: InputMaybe<StringScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type OrganizationsConnection = {
  __typename?: 'OrganizationsConnection';
  aggregate: OrganizationAggregate;
  edges: Array<OrganizationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Pagination information (Relay) */
export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type ParentIdeaRef = {
  __typename?: 'ParentIdeaRef';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: IdeaStatus;
};

export type Project = {
  __typename?: 'Project';
  body?: Maybe<Scalars['String']['output']>;
  children: Array<Epic>;
  childrenConnection: ProjectChildrenConnection;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: ProjectDomainConnection;
  fromDiscovery?: Maybe<Idea>;
  fromDiscoveryConnection: ProjectFromDiscoveryConnection;
  id: Scalars['ID']['output'];
  milestones: Array<DevMilestone>;
  milestonesConnection: ProjectMilestonesConnection;
  name: Scalars['String']['output'];
  parent?: Maybe<Initiative>;
  parentConnection: ProjectParentConnection;
  status: ProjectStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workstreams: Array<DevWorkstream>;
  workstreamsConnection: ProjectWorkstreamsConnection;
};


export type ProjectChildrenArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<EpicSort>>;
  where?: InputMaybe<EpicWhere>;
};


export type ProjectChildrenConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ProjectChildrenConnectionSort>>;
  where?: InputMaybe<ProjectChildrenConnectionWhere>;
};


export type ProjectMilestonesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DevMilestoneSort>>;
  where?: InputMaybe<DevMilestoneWhere>;
};


export type ProjectMilestonesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ProjectMilestonesConnectionSort>>;
  where?: InputMaybe<ProjectMilestonesConnectionWhere>;
};


export type ProjectWorkstreamsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DevWorkstreamSort>>;
  where?: InputMaybe<DevWorkstreamWhere>;
};


export type ProjectWorkstreamsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ProjectWorkstreamsConnectionSort>>;
  where?: InputMaybe<ProjectWorkstreamsConnectionWhere>;
};

export type ProjectAggregate = {
  __typename?: 'ProjectAggregate';
  count: Count;
  node: ProjectAggregateNode;
};

export type ProjectAggregateNode = {
  __typename?: 'ProjectAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type ProjectChildrenAggregateInput = {
  AND?: InputMaybe<Array<ProjectChildrenAggregateInput>>;
  NOT?: InputMaybe<ProjectChildrenAggregateInput>;
  OR?: InputMaybe<Array<ProjectChildrenAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<ProjectChildrenNodeAggregationWhereInput>;
};

export type ProjectChildrenConnectFieldInput = {
  connect?: InputMaybe<Array<EpicConnectInput>>;
  where?: InputMaybe<EpicConnectWhere>;
};

export type ProjectChildrenConnection = {
  __typename?: 'ProjectChildrenConnection';
  aggregate: ProjectEpicChildrenAggregateSelection;
  edges: Array<ProjectChildrenRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProjectChildrenConnectionAggregateInput = {
  AND?: InputMaybe<Array<ProjectChildrenConnectionAggregateInput>>;
  NOT?: InputMaybe<ProjectChildrenConnectionAggregateInput>;
  OR?: InputMaybe<Array<ProjectChildrenConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<ProjectChildrenNodeAggregationWhereInput>;
};

export type ProjectChildrenConnectionFilters = {
  /** Filter Projects by aggregating results on related ProjectChildrenConnections */
  aggregate?: InputMaybe<ProjectChildrenConnectionAggregateInput>;
  /** Return Projects where all of the related ProjectChildrenConnections match this filter */
  all?: InputMaybe<ProjectChildrenConnectionWhere>;
  /** Return Projects where none of the related ProjectChildrenConnections match this filter */
  none?: InputMaybe<ProjectChildrenConnectionWhere>;
  /** Return Projects where one of the related ProjectChildrenConnections match this filter */
  single?: InputMaybe<ProjectChildrenConnectionWhere>;
  /** Return Projects where some of the related ProjectChildrenConnections match this filter */
  some?: InputMaybe<ProjectChildrenConnectionWhere>;
};

export type ProjectChildrenConnectionSort = {
  node?: InputMaybe<EpicSort>;
};

export type ProjectChildrenConnectionWhere = {
  AND?: InputMaybe<Array<ProjectChildrenConnectionWhere>>;
  NOT?: InputMaybe<ProjectChildrenConnectionWhere>;
  OR?: InputMaybe<Array<ProjectChildrenConnectionWhere>>;
  node?: InputMaybe<EpicWhere>;
};

export type ProjectChildrenCreateFieldInput = {
  node: EpicCreateInput;
};

export type ProjectChildrenDeleteFieldInput = {
  delete?: InputMaybe<EpicDeleteInput>;
  where?: InputMaybe<ProjectChildrenConnectionWhere>;
};

export type ProjectChildrenDisconnectFieldInput = {
  disconnect?: InputMaybe<EpicDisconnectInput>;
  where?: InputMaybe<ProjectChildrenConnectionWhere>;
};

export type ProjectChildrenFieldInput = {
  connect?: InputMaybe<Array<ProjectChildrenConnectFieldInput>>;
  create?: InputMaybe<Array<ProjectChildrenCreateFieldInput>>;
};

export type ProjectChildrenNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ProjectChildrenNodeAggregationWhereInput>>;
  NOT?: InputMaybe<ProjectChildrenNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<ProjectChildrenNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type ProjectChildrenRelationship = {
  __typename?: 'ProjectChildrenRelationship';
  cursor: Scalars['String']['output'];
  node: Epic;
};

export type ProjectChildrenUpdateConnectionInput = {
  node?: InputMaybe<EpicUpdateInput>;
  where?: InputMaybe<ProjectChildrenConnectionWhere>;
};

export type ProjectChildrenUpdateFieldInput = {
  connect?: InputMaybe<Array<ProjectChildrenConnectFieldInput>>;
  create?: InputMaybe<Array<ProjectChildrenCreateFieldInput>>;
  delete?: InputMaybe<Array<ProjectChildrenDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<ProjectChildrenDisconnectFieldInput>>;
  update?: InputMaybe<ProjectChildrenUpdateConnectionInput>;
};

export type ProjectConnectInput = {
  children?: InputMaybe<Array<ProjectChildrenConnectFieldInput>>;
  milestones?: InputMaybe<Array<ProjectMilestonesConnectFieldInput>>;
  workstreams?: InputMaybe<Array<ProjectWorkstreamsConnectFieldInput>>;
};

export type ProjectConnectWhere = {
  node: ProjectWhere;
};

export type ProjectCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  children?: InputMaybe<ProjectChildrenFieldInput>;
  domain?: InputMaybe<ProjectDomainFieldInput>;
  fromDiscovery?: InputMaybe<ProjectFromDiscoveryFieldInput>;
  milestones?: InputMaybe<ProjectMilestonesFieldInput>;
  name: Scalars['String']['input'];
  parent?: InputMaybe<ProjectParentFieldInput>;
  status: ProjectStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  workstreams?: InputMaybe<ProjectWorkstreamsFieldInput>;
};

export type ProjectDeleteInput = {
  children?: InputMaybe<Array<ProjectChildrenDeleteFieldInput>>;
  domain?: InputMaybe<ProjectDomainDeleteFieldInput>;
  fromDiscovery?: InputMaybe<ProjectFromDiscoveryDeleteFieldInput>;
  milestones?: InputMaybe<Array<ProjectMilestonesDeleteFieldInput>>;
  parent?: InputMaybe<ProjectParentDeleteFieldInput>;
  workstreams?: InputMaybe<Array<ProjectWorkstreamsDeleteFieldInput>>;
};

export type ProjectDevMilestoneMilestonesAggregateSelection = {
  __typename?: 'ProjectDevMilestoneMilestonesAggregateSelection';
  count: CountConnection;
  node?: Maybe<ProjectDevMilestoneMilestonesNodeAggregateSelection>;
};

export type ProjectDevMilestoneMilestonesNodeAggregateSelection = {
  __typename?: 'ProjectDevMilestoneMilestonesNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  demoCriteria: StringAggregateSelection;
  name: StringAggregateSelection;
  targetDate: DateTimeAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type ProjectDevWorkstreamWorkstreamsAggregateSelection = {
  __typename?: 'ProjectDevWorkstreamWorkstreamsAggregateSelection';
  count: CountConnection;
  node?: Maybe<ProjectDevWorkstreamWorkstreamsNodeAggregateSelection>;
};

export type ProjectDevWorkstreamWorkstreamsNodeAggregateSelection = {
  __typename?: 'ProjectDevWorkstreamWorkstreamsNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  owner: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type ProjectDisconnectInput = {
  children?: InputMaybe<Array<ProjectChildrenDisconnectFieldInput>>;
  milestones?: InputMaybe<Array<ProjectMilestonesDisconnectFieldInput>>;
  workstreams?: InputMaybe<Array<ProjectWorkstreamsDisconnectFieldInput>>;
};

export type ProjectDomainConnection = {
  __typename?: 'ProjectDomainConnection';
  edges: Array<ProjectDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProjectDomainConnectionWhere = {
  AND?: InputMaybe<Array<ProjectDomainConnectionWhere>>;
  NOT?: InputMaybe<ProjectDomainConnectionWhere>;
  OR?: InputMaybe<Array<ProjectDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type ProjectDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type ProjectDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<ProjectDomainConnectionWhere>;
};

export type ProjectDomainFieldInput = {
  create?: InputMaybe<ProjectDomainCreateFieldInput>;
};

export type ProjectDomainRelationship = {
  __typename?: 'ProjectDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type ProjectEdge = {
  __typename?: 'ProjectEdge';
  cursor: Scalars['String']['output'];
  node: Project;
};

export type ProjectEpicChildrenAggregateSelection = {
  __typename?: 'ProjectEpicChildrenAggregateSelection';
  count: CountConnection;
  node?: Maybe<ProjectEpicChildrenNodeAggregateSelection>;
};

export type ProjectEpicChildrenNodeAggregateSelection = {
  __typename?: 'ProjectEpicChildrenNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type ProjectFromDiscoveryConnection = {
  __typename?: 'ProjectFromDiscoveryConnection';
  edges: Array<ProjectFromDiscoveryRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProjectFromDiscoveryConnectionWhere = {
  AND?: InputMaybe<Array<ProjectFromDiscoveryConnectionWhere>>;
  NOT?: InputMaybe<ProjectFromDiscoveryConnectionWhere>;
  OR?: InputMaybe<Array<ProjectFromDiscoveryConnectionWhere>>;
  node?: InputMaybe<IdeaWhere>;
};

export type ProjectFromDiscoveryCreateFieldInput = {
  node: IdeaCreateInput;
};

export type ProjectFromDiscoveryDeleteFieldInput = {
  delete?: InputMaybe<IdeaDeleteInput>;
  where?: InputMaybe<ProjectFromDiscoveryConnectionWhere>;
};

export type ProjectFromDiscoveryFieldInput = {
  create?: InputMaybe<ProjectFromDiscoveryCreateFieldInput>;
};

export type ProjectFromDiscoveryRelationship = {
  __typename?: 'ProjectFromDiscoveryRelationship';
  cursor: Scalars['String']['output'];
  node: Idea;
};

export type ProjectHierarchy = {
  __typename?: 'ProjectHierarchy';
  epics: Array<EpicSummary>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: ProjectStatus;
};

export type ProjectMilestonesAggregateInput = {
  AND?: InputMaybe<Array<ProjectMilestonesAggregateInput>>;
  NOT?: InputMaybe<ProjectMilestonesAggregateInput>;
  OR?: InputMaybe<Array<ProjectMilestonesAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<ProjectMilestonesNodeAggregationWhereInput>;
};

export type ProjectMilestonesConnectFieldInput = {
  where?: InputMaybe<DevMilestoneConnectWhere>;
};

export type ProjectMilestonesConnection = {
  __typename?: 'ProjectMilestonesConnection';
  aggregate: ProjectDevMilestoneMilestonesAggregateSelection;
  edges: Array<ProjectMilestonesRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProjectMilestonesConnectionAggregateInput = {
  AND?: InputMaybe<Array<ProjectMilestonesConnectionAggregateInput>>;
  NOT?: InputMaybe<ProjectMilestonesConnectionAggregateInput>;
  OR?: InputMaybe<Array<ProjectMilestonesConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<ProjectMilestonesNodeAggregationWhereInput>;
};

export type ProjectMilestonesConnectionFilters = {
  /** Filter Projects by aggregating results on related ProjectMilestonesConnections */
  aggregate?: InputMaybe<ProjectMilestonesConnectionAggregateInput>;
  /** Return Projects where all of the related ProjectMilestonesConnections match this filter */
  all?: InputMaybe<ProjectMilestonesConnectionWhere>;
  /** Return Projects where none of the related ProjectMilestonesConnections match this filter */
  none?: InputMaybe<ProjectMilestonesConnectionWhere>;
  /** Return Projects where one of the related ProjectMilestonesConnections match this filter */
  single?: InputMaybe<ProjectMilestonesConnectionWhere>;
  /** Return Projects where some of the related ProjectMilestonesConnections match this filter */
  some?: InputMaybe<ProjectMilestonesConnectionWhere>;
};

export type ProjectMilestonesConnectionSort = {
  node?: InputMaybe<DevMilestoneSort>;
};

export type ProjectMilestonesConnectionWhere = {
  AND?: InputMaybe<Array<ProjectMilestonesConnectionWhere>>;
  NOT?: InputMaybe<ProjectMilestonesConnectionWhere>;
  OR?: InputMaybe<Array<ProjectMilestonesConnectionWhere>>;
  node?: InputMaybe<DevMilestoneWhere>;
};

export type ProjectMilestonesCreateFieldInput = {
  node: DevMilestoneCreateInput;
};

export type ProjectMilestonesDeleteFieldInput = {
  delete?: InputMaybe<DevMilestoneDeleteInput>;
  where?: InputMaybe<ProjectMilestonesConnectionWhere>;
};

export type ProjectMilestonesDisconnectFieldInput = {
  where?: InputMaybe<ProjectMilestonesConnectionWhere>;
};

export type ProjectMilestonesFieldInput = {
  connect?: InputMaybe<Array<ProjectMilestonesConnectFieldInput>>;
  create?: InputMaybe<Array<ProjectMilestonesCreateFieldInput>>;
};

export type ProjectMilestonesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ProjectMilestonesNodeAggregationWhereInput>>;
  NOT?: InputMaybe<ProjectMilestonesNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<ProjectMilestonesNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  demoCriteria?: InputMaybe<StringScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  targetDate?: InputMaybe<DateTimeScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type ProjectMilestonesRelationship = {
  __typename?: 'ProjectMilestonesRelationship';
  cursor: Scalars['String']['output'];
  node: DevMilestone;
};

export type ProjectMilestonesUpdateConnectionInput = {
  node?: InputMaybe<DevMilestoneUpdateInput>;
  where?: InputMaybe<ProjectMilestonesConnectionWhere>;
};

export type ProjectMilestonesUpdateFieldInput = {
  connect?: InputMaybe<Array<ProjectMilestonesConnectFieldInput>>;
  create?: InputMaybe<Array<ProjectMilestonesCreateFieldInput>>;
  delete?: InputMaybe<Array<ProjectMilestonesDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<ProjectMilestonesDisconnectFieldInput>>;
  update?: InputMaybe<ProjectMilestonesUpdateConnectionInput>;
};

export type ProjectParentConnection = {
  __typename?: 'ProjectParentConnection';
  edges: Array<ProjectParentRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProjectParentConnectionWhere = {
  AND?: InputMaybe<Array<ProjectParentConnectionWhere>>;
  NOT?: InputMaybe<ProjectParentConnectionWhere>;
  OR?: InputMaybe<Array<ProjectParentConnectionWhere>>;
  node?: InputMaybe<InitiativeWhere>;
};

export type ProjectParentCreateFieldInput = {
  node: InitiativeCreateInput;
};

export type ProjectParentDeleteFieldInput = {
  delete?: InputMaybe<InitiativeDeleteInput>;
  where?: InputMaybe<ProjectParentConnectionWhere>;
};

export type ProjectParentFieldInput = {
  create?: InputMaybe<ProjectParentCreateFieldInput>;
};

export type ProjectParentRelationship = {
  __typename?: 'ProjectParentRelationship';
  cursor: Scalars['String']['output'];
  node: Initiative;
};

export type ProjectRelationshipFilters = {
  /** Filter type where all of the related Projects match this filter */
  all?: InputMaybe<ProjectWhere>;
  /** Filter type where none of the related Projects match this filter */
  none?: InputMaybe<ProjectWhere>;
  /** Filter type where one of the related Projects match this filter */
  single?: InputMaybe<ProjectWhere>;
  /** Filter type where some of the related Projects match this filter */
  some?: InputMaybe<ProjectWhere>;
};

/** Fields to sort Projects by. The order in which sorts are applied is not guaranteed when specifying many fields in one ProjectSort object. */
export type ProjectSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum ProjectStatus {
  Abandoned = 'ABANDONED',
  Complete = 'COMPLETE',
  InProgress = 'IN_PROGRESS',
  Planning = 'PLANNING',
  Scoping = 'SCOPING'
}

/** ProjectStatus filters */
export type ProjectStatusEnumScalarFilters = {
  eq?: InputMaybe<ProjectStatus>;
  in?: InputMaybe<Array<ProjectStatus>>;
};

/** ProjectStatus mutations */
export type ProjectStatusEnumScalarMutations = {
  set?: InputMaybe<ProjectStatus>;
};

export type ProjectUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  children?: InputMaybe<Array<ProjectChildrenUpdateFieldInput>>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  milestones?: InputMaybe<Array<ProjectMilestonesUpdateFieldInput>>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<ProjectStatusEnumScalarMutations>;
  workstreams?: InputMaybe<Array<ProjectWorkstreamsUpdateFieldInput>>;
};

export type ProjectWhere = {
  AND?: InputMaybe<Array<ProjectWhere>>;
  NOT?: InputMaybe<ProjectWhere>;
  OR?: InputMaybe<Array<ProjectWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  children?: InputMaybe<EpicRelationshipFilters>;
  childrenConnection?: InputMaybe<ProjectChildrenConnectionFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<ProjectDomainConnectionWhere>;
  fromDiscovery?: InputMaybe<IdeaWhere>;
  fromDiscoveryConnection?: InputMaybe<ProjectFromDiscoveryConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  milestones?: InputMaybe<DevMilestoneRelationshipFilters>;
  milestonesConnection?: InputMaybe<ProjectMilestonesConnectionFilters>;
  name?: InputMaybe<StringScalarFilters>;
  parent?: InputMaybe<InitiativeWhere>;
  parentConnection?: InputMaybe<ProjectParentConnectionWhere>;
  status?: InputMaybe<ProjectStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
  workstreams?: InputMaybe<DevWorkstreamRelationshipFilters>;
  workstreamsConnection?: InputMaybe<ProjectWorkstreamsConnectionFilters>;
};

export type ProjectWorkstreamsAggregateInput = {
  AND?: InputMaybe<Array<ProjectWorkstreamsAggregateInput>>;
  NOT?: InputMaybe<ProjectWorkstreamsAggregateInput>;
  OR?: InputMaybe<Array<ProjectWorkstreamsAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<ProjectWorkstreamsNodeAggregationWhereInput>;
};

export type ProjectWorkstreamsConnectFieldInput = {
  where?: InputMaybe<DevWorkstreamConnectWhere>;
};

export type ProjectWorkstreamsConnection = {
  __typename?: 'ProjectWorkstreamsConnection';
  aggregate: ProjectDevWorkstreamWorkstreamsAggregateSelection;
  edges: Array<ProjectWorkstreamsRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProjectWorkstreamsConnectionAggregateInput = {
  AND?: InputMaybe<Array<ProjectWorkstreamsConnectionAggregateInput>>;
  NOT?: InputMaybe<ProjectWorkstreamsConnectionAggregateInput>;
  OR?: InputMaybe<Array<ProjectWorkstreamsConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<ProjectWorkstreamsNodeAggregationWhereInput>;
};

export type ProjectWorkstreamsConnectionFilters = {
  /** Filter Projects by aggregating results on related ProjectWorkstreamsConnections */
  aggregate?: InputMaybe<ProjectWorkstreamsConnectionAggregateInput>;
  /** Return Projects where all of the related ProjectWorkstreamsConnections match this filter */
  all?: InputMaybe<ProjectWorkstreamsConnectionWhere>;
  /** Return Projects where none of the related ProjectWorkstreamsConnections match this filter */
  none?: InputMaybe<ProjectWorkstreamsConnectionWhere>;
  /** Return Projects where one of the related ProjectWorkstreamsConnections match this filter */
  single?: InputMaybe<ProjectWorkstreamsConnectionWhere>;
  /** Return Projects where some of the related ProjectWorkstreamsConnections match this filter */
  some?: InputMaybe<ProjectWorkstreamsConnectionWhere>;
};

export type ProjectWorkstreamsConnectionSort = {
  node?: InputMaybe<DevWorkstreamSort>;
};

export type ProjectWorkstreamsConnectionWhere = {
  AND?: InputMaybe<Array<ProjectWorkstreamsConnectionWhere>>;
  NOT?: InputMaybe<ProjectWorkstreamsConnectionWhere>;
  OR?: InputMaybe<Array<ProjectWorkstreamsConnectionWhere>>;
  node?: InputMaybe<DevWorkstreamWhere>;
};

export type ProjectWorkstreamsCreateFieldInput = {
  node: DevWorkstreamCreateInput;
};

export type ProjectWorkstreamsDeleteFieldInput = {
  delete?: InputMaybe<DevWorkstreamDeleteInput>;
  where?: InputMaybe<ProjectWorkstreamsConnectionWhere>;
};

export type ProjectWorkstreamsDisconnectFieldInput = {
  where?: InputMaybe<ProjectWorkstreamsConnectionWhere>;
};

export type ProjectWorkstreamsFieldInput = {
  connect?: InputMaybe<Array<ProjectWorkstreamsConnectFieldInput>>;
  create?: InputMaybe<Array<ProjectWorkstreamsCreateFieldInput>>;
};

export type ProjectWorkstreamsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ProjectWorkstreamsNodeAggregationWhereInput>>;
  NOT?: InputMaybe<ProjectWorkstreamsNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<ProjectWorkstreamsNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  owner?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type ProjectWorkstreamsRelationship = {
  __typename?: 'ProjectWorkstreamsRelationship';
  cursor: Scalars['String']['output'];
  node: DevWorkstream;
};

export type ProjectWorkstreamsUpdateConnectionInput = {
  node?: InputMaybe<DevWorkstreamUpdateInput>;
  where?: InputMaybe<ProjectWorkstreamsConnectionWhere>;
};

export type ProjectWorkstreamsUpdateFieldInput = {
  connect?: InputMaybe<Array<ProjectWorkstreamsConnectFieldInput>>;
  create?: InputMaybe<Array<ProjectWorkstreamsCreateFieldInput>>;
  delete?: InputMaybe<Array<ProjectWorkstreamsDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<ProjectWorkstreamsDisconnectFieldInput>>;
  update?: InputMaybe<ProjectWorkstreamsUpdateConnectionInput>;
};

export type ProjectsConnection = {
  __typename?: 'ProjectsConnection';
  aggregate: ProjectAggregate;
  edges: Array<ProjectEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  adrs: Array<Adr>;
  adrsConnection: AdrsConnection;
  assumptions: Array<Assumption>;
  assumptionsConnection: AssumptionsConnection;
  bugs: Array<Bug>;
  bugsConnection: BugsConnection;
  chores: Array<Chore>;
  choresConnection: ChoresConnection;
  devMilestones: Array<DevMilestone>;
  devMilestonesConnection: DevMilestonesConnection;
  devWorkstreams: Array<DevWorkstream>;
  devWorkstreamsConnection: DevWorkstreamsConnection;
  discoveryHealth?: Maybe<DiscoveryHealth>;
  domains: Array<Domain>;
  domainsConnection: DomainsConnection;
  enhancements: Array<Enhancement>;
  enhancementsConnection: EnhancementsConnection;
  epics: Array<Epic>;
  epicsConnection: EpicsConnection;
  experiments: Array<Experiment>;
  experimentsConnection: ExperimentsConnection;
  graphHealth?: Maybe<GraphHealth>;
  ideas: Array<Idea>;
  ideasConnection: IdeasConnection;
  initiatives: Array<Initiative>;
  initiativesConnection: InitiativesConnection;
  objectiveSubgraph?: Maybe<ObjectiveSubgraphResult>;
  objectives: Array<Objective>;
  objectivesConnection: ObjectivesConnection;
  opportunities: Array<Opportunity>;
  opportunitiesConnection: OpportunitiesConnection;
  opportunitySubgraph?: Maybe<OpportunitySubgraph>;
  organizations: Array<Organization>;
  organizationsConnection: OrganizationsConnection;
  orphanedOpportunities: Array<Opportunity>;
  projectHierarchy?: Maybe<ProjectHierarchy>;
  projects: Array<Project>;
  projectsConnection: ProjectsConnection;
  specs: Array<Spec>;
  specsConnection: SpecsConnection;
  spikes: Array<Spike>;
  spikesConnection: SpikesConnection;
  stories: Array<Story>;
  storiesConnection: StoriesConnection;
  tasks: Array<Task>;
  tasksConnection: TasksConnection;
  unrootedAssumptions: Array<Assumption>;
  unrootedIdeas: Array<Idea>;
  untestedAssumptions: Array<UntestedAssumptionWithContext>;
  users: Array<User>;
  usersConnection: UsersConnection;
};


export type QueryAdrsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<AdrSort>>;
  where?: InputMaybe<AdrWhere>;
};


export type QueryAdrsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<AdrSort>>;
  where?: InputMaybe<AdrWhere>;
};


export type QueryAssumptionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<AssumptionSort>>;
  where?: InputMaybe<AssumptionWhere>;
};


export type QueryAssumptionsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<AssumptionSort>>;
  where?: InputMaybe<AssumptionWhere>;
};


export type QueryBugsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<BugSort>>;
  where?: InputMaybe<BugWhere>;
};


export type QueryBugsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<BugSort>>;
  where?: InputMaybe<BugWhere>;
};


export type QueryChoresArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ChoreSort>>;
  where?: InputMaybe<ChoreWhere>;
};


export type QueryChoresConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ChoreSort>>;
  where?: InputMaybe<ChoreWhere>;
};


export type QueryDevMilestonesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DevMilestoneSort>>;
  where?: InputMaybe<DevMilestoneWhere>;
};


export type QueryDevMilestonesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DevMilestoneSort>>;
  where?: InputMaybe<DevMilestoneWhere>;
};


export type QueryDevWorkstreamsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DevWorkstreamSort>>;
  where?: InputMaybe<DevWorkstreamWhere>;
};


export type QueryDevWorkstreamsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DevWorkstreamSort>>;
  where?: InputMaybe<DevWorkstreamWhere>;
};


export type QueryDiscoveryHealthArgs = {
  domainSlug: Scalars['String']['input'];
};


export type QueryDomainsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DomainSort>>;
  where?: InputMaybe<DomainWhere>;
};


export type QueryDomainsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DomainSort>>;
  where?: InputMaybe<DomainWhere>;
};


export type QueryEnhancementsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<EnhancementSort>>;
  where?: InputMaybe<EnhancementWhere>;
};


export type QueryEnhancementsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<EnhancementSort>>;
  where?: InputMaybe<EnhancementWhere>;
};


export type QueryEpicsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<EpicSort>>;
  where?: InputMaybe<EpicWhere>;
};


export type QueryEpicsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<EpicSort>>;
  where?: InputMaybe<EpicWhere>;
};


export type QueryExperimentsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ExperimentSort>>;
  where?: InputMaybe<ExperimentWhere>;
};


export type QueryExperimentsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ExperimentSort>>;
  where?: InputMaybe<ExperimentWhere>;
};


export type QueryGraphHealthArgs = {
  domainSlug: Scalars['String']['input'];
};


export type QueryIdeasArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<IdeaSort>>;
  where?: InputMaybe<IdeaWhere>;
};


export type QueryIdeasConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<IdeaSort>>;
  where?: InputMaybe<IdeaWhere>;
};


export type QueryInitiativesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<InitiativeSort>>;
  where?: InputMaybe<InitiativeWhere>;
};


export type QueryInitiativesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<InitiativeSort>>;
  where?: InputMaybe<InitiativeWhere>;
};


export type QueryObjectiveSubgraphArgs = {
  domainSlug: Scalars['String']['input'];
  objectiveId: Scalars['ID']['input'];
};


export type QueryObjectivesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ObjectiveSort>>;
  where?: InputMaybe<ObjectiveWhere>;
};


export type QueryObjectivesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ObjectiveSort>>;
  where?: InputMaybe<ObjectiveWhere>;
};


export type QueryOpportunitiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<OpportunitySort>>;
  where?: InputMaybe<OpportunityWhere>;
};


export type QueryOpportunitiesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<OpportunitySort>>;
  where?: InputMaybe<OpportunityWhere>;
};


export type QueryOpportunitySubgraphArgs = {
  domainSlug: Scalars['String']['input'];
  opportunityId: Scalars['ID']['input'];
};


export type QueryOrganizationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<OrganizationSort>>;
  where?: InputMaybe<OrganizationWhere>;
};


export type QueryOrganizationsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<OrganizationSort>>;
  where?: InputMaybe<OrganizationWhere>;
};


export type QueryOrphanedOpportunitiesArgs = {
  domainSlug: Scalars['String']['input'];
};


export type QueryProjectHierarchyArgs = {
  domainSlug: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type QueryProjectsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ProjectSort>>;
  where?: InputMaybe<ProjectWhere>;
};


export type QueryProjectsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<ProjectSort>>;
  where?: InputMaybe<ProjectWhere>;
};


export type QuerySpecsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<SpecSort>>;
  where?: InputMaybe<SpecWhere>;
};


export type QuerySpecsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<SpecSort>>;
  where?: InputMaybe<SpecWhere>;
};


export type QuerySpikesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<SpikeSort>>;
  where?: InputMaybe<SpikeWhere>;
};


export type QuerySpikesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<SpikeSort>>;
  where?: InputMaybe<SpikeWhere>;
};


export type QueryStoriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<StorySort>>;
  where?: InputMaybe<StoryWhere>;
};


export type QueryStoriesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<StorySort>>;
  where?: InputMaybe<StoryWhere>;
};


export type QueryTasksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<TaskSort>>;
  where?: InputMaybe<TaskWhere>;
};


export type QueryTasksConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<TaskSort>>;
  where?: InputMaybe<TaskWhere>;
};


export type QueryUnrootedAssumptionsArgs = {
  domainSlug: Scalars['String']['input'];
};


export type QueryUnrootedIdeasArgs = {
  domainSlug: Scalars['String']['input'];
};


export type QueryUntestedAssumptionsArgs = {
  domainSlug: Scalars['String']['input'];
  minImportance?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<UserSort>>;
  where?: InputMaybe<UserWhere>;
};


export type QueryUsersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<UserSort>>;
  where?: InputMaybe<UserWhere>;
};

/** An enum for sorting in either ascending or descending order. */
export enum SortDirection {
  /** Sort by field values in ascending order. */
  Asc = 'ASC',
  /** Sort by field values in descending order. */
  Desc = 'DESC'
}

export type Spec = {
  __typename?: 'Spec';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: SpecDomainConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  specFor?: Maybe<Project>;
  specForConnection: SpecSpecForConnection;
  status: SpecStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type SpecAggregate = {
  __typename?: 'SpecAggregate';
  count: Count;
  node: SpecAggregateNode;
};

export type SpecAggregateNode = {
  __typename?: 'SpecAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type SpecCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<SpecDomainFieldInput>;
  name: Scalars['String']['input'];
  specFor?: InputMaybe<SpecSpecForFieldInput>;
  status: SpecStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type SpecDeleteInput = {
  domain?: InputMaybe<SpecDomainDeleteFieldInput>;
  specFor?: InputMaybe<SpecSpecForDeleteFieldInput>;
};

export type SpecDomainConnection = {
  __typename?: 'SpecDomainConnection';
  edges: Array<SpecDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SpecDomainConnectionWhere = {
  AND?: InputMaybe<Array<SpecDomainConnectionWhere>>;
  NOT?: InputMaybe<SpecDomainConnectionWhere>;
  OR?: InputMaybe<Array<SpecDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type SpecDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type SpecDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<SpecDomainConnectionWhere>;
};

export type SpecDomainFieldInput = {
  create?: InputMaybe<SpecDomainCreateFieldInput>;
};

export type SpecDomainRelationship = {
  __typename?: 'SpecDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type SpecEdge = {
  __typename?: 'SpecEdge';
  cursor: Scalars['String']['output'];
  node: Spec;
};

/** Fields to sort Specs by. The order in which sorts are applied is not guaranteed when specifying many fields in one SpecSort object. */
export type SpecSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export type SpecSpecForConnection = {
  __typename?: 'SpecSpecForConnection';
  edges: Array<SpecSpecForRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SpecSpecForConnectionWhere = {
  AND?: InputMaybe<Array<SpecSpecForConnectionWhere>>;
  NOT?: InputMaybe<SpecSpecForConnectionWhere>;
  OR?: InputMaybe<Array<SpecSpecForConnectionWhere>>;
  node?: InputMaybe<ProjectWhere>;
};

export type SpecSpecForCreateFieldInput = {
  node: ProjectCreateInput;
};

export type SpecSpecForDeleteFieldInput = {
  delete?: InputMaybe<ProjectDeleteInput>;
  where?: InputMaybe<SpecSpecForConnectionWhere>;
};

export type SpecSpecForFieldInput = {
  create?: InputMaybe<SpecSpecForCreateFieldInput>;
};

export type SpecSpecForRelationship = {
  __typename?: 'SpecSpecForRelationship';
  cursor: Scalars['String']['output'];
  node: Project;
};

export enum SpecStatus {
  Approved = 'APPROVED',
  Draft = 'DRAFT',
  Review = 'REVIEW',
  Superseded = 'SUPERSEDED'
}

/** SpecStatus filters */
export type SpecStatusEnumScalarFilters = {
  eq?: InputMaybe<SpecStatus>;
  in?: InputMaybe<Array<SpecStatus>>;
};

/** SpecStatus mutations */
export type SpecStatusEnumScalarMutations = {
  set?: InputMaybe<SpecStatus>;
};

export type SpecUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<SpecStatusEnumScalarMutations>;
};

export type SpecWhere = {
  AND?: InputMaybe<Array<SpecWhere>>;
  NOT?: InputMaybe<SpecWhere>;
  OR?: InputMaybe<Array<SpecWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<SpecDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  specFor?: InputMaybe<ProjectWhere>;
  specForConnection?: InputMaybe<SpecSpecForConnectionWhere>;
  status?: InputMaybe<SpecStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type SpecsConnection = {
  __typename?: 'SpecsConnection';
  aggregate: SpecAggregate;
  edges: Array<SpecEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Spike = {
  __typename?: 'Spike';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  decisionCriteria?: Maybe<Scalars['String']['output']>;
  domain?: Maybe<Domain>;
  domainConnection: SpikeDomainConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  outcome?: Maybe<SpikeOutcome>;
  question?: Maybe<Scalars['String']['output']>;
  result?: Maybe<Scalars['String']['output']>;
  status: SpikeStatus;
  timeBox?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type SpikeAggregate = {
  __typename?: 'SpikeAggregate';
  count: Count;
  node: SpikeAggregateNode;
};

export type SpikeAggregateNode = {
  __typename?: 'SpikeAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  decisionCriteria: StringAggregateSelection;
  name: StringAggregateSelection;
  question: StringAggregateSelection;
  result: StringAggregateSelection;
  timeBox: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type SpikeCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  decisionCriteria?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<SpikeDomainFieldInput>;
  name: Scalars['String']['input'];
  outcome?: InputMaybe<SpikeOutcome>;
  question?: InputMaybe<Scalars['String']['input']>;
  result?: InputMaybe<Scalars['String']['input']>;
  status: SpikeStatus;
  timeBox?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type SpikeDeleteInput = {
  domain?: InputMaybe<SpikeDomainDeleteFieldInput>;
};

export type SpikeDomainConnection = {
  __typename?: 'SpikeDomainConnection';
  edges: Array<SpikeDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SpikeDomainConnectionWhere = {
  AND?: InputMaybe<Array<SpikeDomainConnectionWhere>>;
  NOT?: InputMaybe<SpikeDomainConnectionWhere>;
  OR?: InputMaybe<Array<SpikeDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type SpikeDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type SpikeDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<SpikeDomainConnectionWhere>;
};

export type SpikeDomainFieldInput = {
  create?: InputMaybe<SpikeDomainCreateFieldInput>;
};

export type SpikeDomainRelationship = {
  __typename?: 'SpikeDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type SpikeEdge = {
  __typename?: 'SpikeEdge';
  cursor: Scalars['String']['output'];
  node: Spike;
};

export enum SpikeOutcome {
  Adr = 'ADR',
  Finding = 'FINDING',
  ProofOfConcept = 'PROOF_OF_CONCEPT'
}

/** SpikeOutcome filters */
export type SpikeOutcomeEnumScalarFilters = {
  eq?: InputMaybe<SpikeOutcome>;
  in?: InputMaybe<Array<SpikeOutcome>>;
};

/** SpikeOutcome mutations */
export type SpikeOutcomeEnumScalarMutations = {
  set?: InputMaybe<SpikeOutcome>;
};

/** Fields to sort Spikes by. The order in which sorts are applied is not guaranteed when specifying many fields in one SpikeSort object. */
export type SpikeSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  decisionCriteria?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  outcome?: InputMaybe<SortDirection>;
  question?: InputMaybe<SortDirection>;
  result?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  timeBox?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum SpikeStatus {
  Complete = 'COMPLETE',
  InProgress = 'IN_PROGRESS',
  Planned = 'PLANNED'
}

/** SpikeStatus filters */
export type SpikeStatusEnumScalarFilters = {
  eq?: InputMaybe<SpikeStatus>;
  in?: InputMaybe<Array<SpikeStatus>>;
};

/** SpikeStatus mutations */
export type SpikeStatusEnumScalarMutations = {
  set?: InputMaybe<SpikeStatus>;
};

export type SpikeUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  decisionCriteria?: InputMaybe<StringScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  outcome?: InputMaybe<SpikeOutcomeEnumScalarMutations>;
  question?: InputMaybe<StringScalarMutations>;
  result?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<SpikeStatusEnumScalarMutations>;
  timeBox?: InputMaybe<StringScalarMutations>;
};

export type SpikeWhere = {
  AND?: InputMaybe<Array<SpikeWhere>>;
  NOT?: InputMaybe<SpikeWhere>;
  OR?: InputMaybe<Array<SpikeWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  decisionCriteria?: InputMaybe<StringScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<SpikeDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  outcome?: InputMaybe<SpikeOutcomeEnumScalarFilters>;
  question?: InputMaybe<StringScalarFilters>;
  result?: InputMaybe<StringScalarFilters>;
  status?: InputMaybe<SpikeStatusEnumScalarFilters>;
  timeBox?: InputMaybe<StringScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type SpikesConnection = {
  __typename?: 'SpikesConnection';
  aggregate: SpikeAggregate;
  edges: Array<SpikeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type StoriesConnection = {
  __typename?: 'StoriesConnection';
  aggregate: StoryAggregate;
  edges: Array<StoryEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Story = {
  __typename?: 'Story';
  acceptanceCriteria?: Maybe<Scalars['String']['output']>;
  body?: Maybe<Scalars['String']['output']>;
  children: Array<Task>;
  childrenConnection: StoryChildrenConnection;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: StoryDomainConnection;
  id: Scalars['ID']['output'];
  milestone?: Maybe<DevMilestone>;
  milestoneConnection: StoryMilestoneConnection;
  name: Scalars['String']['output'];
  parent?: Maybe<Epic>;
  parentConnection: StoryParentConnection;
  status: StoryStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workstream?: Maybe<DevWorkstream>;
  workstreamConnection: StoryWorkstreamConnection;
};


export type StoryChildrenArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<TaskSort>>;
  where?: InputMaybe<TaskWhere>;
};


export type StoryChildrenConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<StoryChildrenConnectionSort>>;
  where?: InputMaybe<StoryChildrenConnectionWhere>;
};

export type StoryAggregate = {
  __typename?: 'StoryAggregate';
  count: Count;
  node: StoryAggregateNode;
};

export type StoryAggregateNode = {
  __typename?: 'StoryAggregateNode';
  acceptanceCriteria: StringAggregateSelection;
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type StoryChildrenAggregateInput = {
  AND?: InputMaybe<Array<StoryChildrenAggregateInput>>;
  NOT?: InputMaybe<StoryChildrenAggregateInput>;
  OR?: InputMaybe<Array<StoryChildrenAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  node?: InputMaybe<StoryChildrenNodeAggregationWhereInput>;
};

export type StoryChildrenConnectFieldInput = {
  where?: InputMaybe<TaskConnectWhere>;
};

export type StoryChildrenConnection = {
  __typename?: 'StoryChildrenConnection';
  aggregate: StoryTaskChildrenAggregateSelection;
  edges: Array<StoryChildrenRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type StoryChildrenConnectionAggregateInput = {
  AND?: InputMaybe<Array<StoryChildrenConnectionAggregateInput>>;
  NOT?: InputMaybe<StoryChildrenConnectionAggregateInput>;
  OR?: InputMaybe<Array<StoryChildrenConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  node?: InputMaybe<StoryChildrenNodeAggregationWhereInput>;
};

export type StoryChildrenConnectionFilters = {
  /** Filter Stories by aggregating results on related StoryChildrenConnections */
  aggregate?: InputMaybe<StoryChildrenConnectionAggregateInput>;
  /** Return Stories where all of the related StoryChildrenConnections match this filter */
  all?: InputMaybe<StoryChildrenConnectionWhere>;
  /** Return Stories where none of the related StoryChildrenConnections match this filter */
  none?: InputMaybe<StoryChildrenConnectionWhere>;
  /** Return Stories where one of the related StoryChildrenConnections match this filter */
  single?: InputMaybe<StoryChildrenConnectionWhere>;
  /** Return Stories where some of the related StoryChildrenConnections match this filter */
  some?: InputMaybe<StoryChildrenConnectionWhere>;
};

export type StoryChildrenConnectionSort = {
  node?: InputMaybe<TaskSort>;
};

export type StoryChildrenConnectionWhere = {
  AND?: InputMaybe<Array<StoryChildrenConnectionWhere>>;
  NOT?: InputMaybe<StoryChildrenConnectionWhere>;
  OR?: InputMaybe<Array<StoryChildrenConnectionWhere>>;
  node?: InputMaybe<TaskWhere>;
};

export type StoryChildrenCreateFieldInput = {
  node: TaskCreateInput;
};

export type StoryChildrenDeleteFieldInput = {
  delete?: InputMaybe<TaskDeleteInput>;
  where?: InputMaybe<StoryChildrenConnectionWhere>;
};

export type StoryChildrenDisconnectFieldInput = {
  where?: InputMaybe<StoryChildrenConnectionWhere>;
};

export type StoryChildrenFieldInput = {
  connect?: InputMaybe<Array<StoryChildrenConnectFieldInput>>;
  create?: InputMaybe<Array<StoryChildrenCreateFieldInput>>;
};

export type StoryChildrenNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<StoryChildrenNodeAggregationWhereInput>>;
  NOT?: InputMaybe<StoryChildrenNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<StoryChildrenNodeAggregationWhereInput>>;
  body?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type StoryChildrenRelationship = {
  __typename?: 'StoryChildrenRelationship';
  cursor: Scalars['String']['output'];
  node: Task;
};

export type StoryChildrenUpdateConnectionInput = {
  node?: InputMaybe<TaskUpdateInput>;
  where?: InputMaybe<StoryChildrenConnectionWhere>;
};

export type StoryChildrenUpdateFieldInput = {
  connect?: InputMaybe<Array<StoryChildrenConnectFieldInput>>;
  create?: InputMaybe<Array<StoryChildrenCreateFieldInput>>;
  delete?: InputMaybe<Array<StoryChildrenDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<StoryChildrenDisconnectFieldInput>>;
  update?: InputMaybe<StoryChildrenUpdateConnectionInput>;
};

export type StoryConnectInput = {
  children?: InputMaybe<Array<StoryChildrenConnectFieldInput>>;
};

export type StoryConnectWhere = {
  node: StoryWhere;
};

export type StoryCreateInput = {
  acceptanceCriteria?: InputMaybe<Scalars['String']['input']>;
  body?: InputMaybe<Scalars['String']['input']>;
  children?: InputMaybe<StoryChildrenFieldInput>;
  domain?: InputMaybe<StoryDomainFieldInput>;
  milestone?: InputMaybe<StoryMilestoneFieldInput>;
  name: Scalars['String']['input'];
  parent?: InputMaybe<StoryParentFieldInput>;
  status: StoryStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  workstream?: InputMaybe<StoryWorkstreamFieldInput>;
};

export type StoryDeleteInput = {
  children?: InputMaybe<Array<StoryChildrenDeleteFieldInput>>;
  domain?: InputMaybe<StoryDomainDeleteFieldInput>;
  milestone?: InputMaybe<StoryMilestoneDeleteFieldInput>;
  parent?: InputMaybe<StoryParentDeleteFieldInput>;
  workstream?: InputMaybe<StoryWorkstreamDeleteFieldInput>;
};

export type StoryDisconnectInput = {
  children?: InputMaybe<Array<StoryChildrenDisconnectFieldInput>>;
};

export type StoryDomainConnection = {
  __typename?: 'StoryDomainConnection';
  edges: Array<StoryDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type StoryDomainConnectionWhere = {
  AND?: InputMaybe<Array<StoryDomainConnectionWhere>>;
  NOT?: InputMaybe<StoryDomainConnectionWhere>;
  OR?: InputMaybe<Array<StoryDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type StoryDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type StoryDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<StoryDomainConnectionWhere>;
};

export type StoryDomainFieldInput = {
  create?: InputMaybe<StoryDomainCreateFieldInput>;
};

export type StoryDomainRelationship = {
  __typename?: 'StoryDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type StoryEdge = {
  __typename?: 'StoryEdge';
  cursor: Scalars['String']['output'];
  node: Story;
};

export type StoryMilestoneConnection = {
  __typename?: 'StoryMilestoneConnection';
  edges: Array<StoryMilestoneRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type StoryMilestoneConnectionWhere = {
  AND?: InputMaybe<Array<StoryMilestoneConnectionWhere>>;
  NOT?: InputMaybe<StoryMilestoneConnectionWhere>;
  OR?: InputMaybe<Array<StoryMilestoneConnectionWhere>>;
  node?: InputMaybe<DevMilestoneWhere>;
};

export type StoryMilestoneCreateFieldInput = {
  node: DevMilestoneCreateInput;
};

export type StoryMilestoneDeleteFieldInput = {
  delete?: InputMaybe<DevMilestoneDeleteInput>;
  where?: InputMaybe<StoryMilestoneConnectionWhere>;
};

export type StoryMilestoneFieldInput = {
  create?: InputMaybe<StoryMilestoneCreateFieldInput>;
};

export type StoryMilestoneRelationship = {
  __typename?: 'StoryMilestoneRelationship';
  cursor: Scalars['String']['output'];
  node: DevMilestone;
};

export type StoryParentConnection = {
  __typename?: 'StoryParentConnection';
  edges: Array<StoryParentRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type StoryParentConnectionWhere = {
  AND?: InputMaybe<Array<StoryParentConnectionWhere>>;
  NOT?: InputMaybe<StoryParentConnectionWhere>;
  OR?: InputMaybe<Array<StoryParentConnectionWhere>>;
  node?: InputMaybe<EpicWhere>;
};

export type StoryParentCreateFieldInput = {
  node: EpicCreateInput;
};

export type StoryParentDeleteFieldInput = {
  delete?: InputMaybe<EpicDeleteInput>;
  where?: InputMaybe<StoryParentConnectionWhere>;
};

export type StoryParentFieldInput = {
  create?: InputMaybe<StoryParentCreateFieldInput>;
};

export type StoryParentRelationship = {
  __typename?: 'StoryParentRelationship';
  cursor: Scalars['String']['output'];
  node: Epic;
};

export type StoryRelationshipFilters = {
  /** Filter type where all of the related Stories match this filter */
  all?: InputMaybe<StoryWhere>;
  /** Filter type where none of the related Stories match this filter */
  none?: InputMaybe<StoryWhere>;
  /** Filter type where one of the related Stories match this filter */
  single?: InputMaybe<StoryWhere>;
  /** Filter type where some of the related Stories match this filter */
  some?: InputMaybe<StoryWhere>;
};

/** Fields to sort Stories by. The order in which sorts are applied is not guaranteed when specifying many fields in one StorySort object. */
export type StorySort = {
  acceptanceCriteria?: InputMaybe<SortDirection>;
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum StoryStatus {
  Complete = 'COMPLETE',
  Draft = 'DRAFT',
  InProgress = 'IN_PROGRESS',
  Ready = 'READY'
}

/** StoryStatus filters */
export type StoryStatusEnumScalarFilters = {
  eq?: InputMaybe<StoryStatus>;
  in?: InputMaybe<Array<StoryStatus>>;
};

/** StoryStatus mutations */
export type StoryStatusEnumScalarMutations = {
  set?: InputMaybe<StoryStatus>;
};

export type StorySummary = {
  __typename?: 'StorySummary';
  acceptanceCriteria?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: StoryStatus;
  tasks: Array<TaskSummary>;
};

export type StoryTaskChildrenAggregateSelection = {
  __typename?: 'StoryTaskChildrenAggregateSelection';
  count: CountConnection;
  node?: Maybe<StoryTaskChildrenNodeAggregateSelection>;
};

export type StoryTaskChildrenNodeAggregateSelection = {
  __typename?: 'StoryTaskChildrenNodeAggregateSelection';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type StoryUpdateInput = {
  acceptanceCriteria?: InputMaybe<StringScalarMutations>;
  body?: InputMaybe<StringScalarMutations>;
  children?: InputMaybe<Array<StoryChildrenUpdateFieldInput>>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<StoryStatusEnumScalarMutations>;
};

export type StoryWhere = {
  AND?: InputMaybe<Array<StoryWhere>>;
  NOT?: InputMaybe<StoryWhere>;
  OR?: InputMaybe<Array<StoryWhere>>;
  acceptanceCriteria?: InputMaybe<StringScalarFilters>;
  body?: InputMaybe<StringScalarFilters>;
  children?: InputMaybe<TaskRelationshipFilters>;
  childrenConnection?: InputMaybe<StoryChildrenConnectionFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<StoryDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  milestone?: InputMaybe<DevMilestoneWhere>;
  milestoneConnection?: InputMaybe<StoryMilestoneConnectionWhere>;
  name?: InputMaybe<StringScalarFilters>;
  parent?: InputMaybe<EpicWhere>;
  parentConnection?: InputMaybe<StoryParentConnectionWhere>;
  status?: InputMaybe<StoryStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
  workstream?: InputMaybe<DevWorkstreamWhere>;
  workstreamConnection?: InputMaybe<StoryWorkstreamConnectionWhere>;
};

export type StoryWorkstreamConnection = {
  __typename?: 'StoryWorkstreamConnection';
  edges: Array<StoryWorkstreamRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type StoryWorkstreamConnectionWhere = {
  AND?: InputMaybe<Array<StoryWorkstreamConnectionWhere>>;
  NOT?: InputMaybe<StoryWorkstreamConnectionWhere>;
  OR?: InputMaybe<Array<StoryWorkstreamConnectionWhere>>;
  node?: InputMaybe<DevWorkstreamWhere>;
};

export type StoryWorkstreamCreateFieldInput = {
  node: DevWorkstreamCreateInput;
};

export type StoryWorkstreamDeleteFieldInput = {
  delete?: InputMaybe<DevWorkstreamDeleteInput>;
  where?: InputMaybe<StoryWorkstreamConnectionWhere>;
};

export type StoryWorkstreamFieldInput = {
  create?: InputMaybe<StoryWorkstreamCreateFieldInput>;
};

export type StoryWorkstreamRelationship = {
  __typename?: 'StoryWorkstreamRelationship';
  cursor: Scalars['String']['output'];
  node: DevWorkstream;
};

export type StringAggregateSelection = {
  __typename?: 'StringAggregateSelection';
  longest?: Maybe<Scalars['String']['output']>;
  shortest?: Maybe<Scalars['String']['output']>;
};

/** String list filters */
export type StringListFilters = {
  eq?: InputMaybe<Array<Scalars['String']['input']>>;
  includes?: InputMaybe<Scalars['String']['input']>;
};

/** Filters for an aggregation of a string field */
export type StringScalarAggregationFilters = {
  averageLength?: InputMaybe<FloatScalarFilters>;
  longestLength?: InputMaybe<IntScalarFilters>;
  shortestLength?: InputMaybe<IntScalarFilters>;
};

/** String filters */
export type StringScalarFilters = {
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** String mutations */
export type StringScalarMutations = {
  set?: InputMaybe<Scalars['String']['input']>;
};

export type Task = {
  __typename?: 'Task';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Domain>;
  domainConnection: TaskDomainConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parent?: Maybe<Story>;
  parentConnection: TaskParentConnection;
  status: TaskStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workstream?: Maybe<DevWorkstream>;
  workstreamConnection: TaskWorkstreamConnection;
};

export type TaskAggregate = {
  __typename?: 'TaskAggregate';
  count: Count;
  node: TaskAggregateNode;
};

export type TaskAggregateNode = {
  __typename?: 'TaskAggregateNode';
  body: StringAggregateSelection;
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type TaskConnectWhere = {
  node: TaskWhere;
};

export type TaskCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<TaskDomainFieldInput>;
  name: Scalars['String']['input'];
  parent?: InputMaybe<TaskParentFieldInput>;
  status: TaskStatus;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  workstream?: InputMaybe<TaskWorkstreamFieldInput>;
};

export type TaskDeleteInput = {
  domain?: InputMaybe<TaskDomainDeleteFieldInput>;
  parent?: InputMaybe<TaskParentDeleteFieldInput>;
  workstream?: InputMaybe<TaskWorkstreamDeleteFieldInput>;
};

export type TaskDomainConnection = {
  __typename?: 'TaskDomainConnection';
  edges: Array<TaskDomainRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TaskDomainConnectionWhere = {
  AND?: InputMaybe<Array<TaskDomainConnectionWhere>>;
  NOT?: InputMaybe<TaskDomainConnectionWhere>;
  OR?: InputMaybe<Array<TaskDomainConnectionWhere>>;
  node?: InputMaybe<DomainWhere>;
};

export type TaskDomainCreateFieldInput = {
  node: DomainCreateInput;
};

export type TaskDomainDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<TaskDomainConnectionWhere>;
};

export type TaskDomainFieldInput = {
  create?: InputMaybe<TaskDomainCreateFieldInput>;
};

export type TaskDomainRelationship = {
  __typename?: 'TaskDomainRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
};

export type TaskEdge = {
  __typename?: 'TaskEdge';
  cursor: Scalars['String']['output'];
  node: Task;
};

export type TaskParentConnection = {
  __typename?: 'TaskParentConnection';
  edges: Array<TaskParentRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TaskParentConnectionWhere = {
  AND?: InputMaybe<Array<TaskParentConnectionWhere>>;
  NOT?: InputMaybe<TaskParentConnectionWhere>;
  OR?: InputMaybe<Array<TaskParentConnectionWhere>>;
  node?: InputMaybe<StoryWhere>;
};

export type TaskParentCreateFieldInput = {
  node: StoryCreateInput;
};

export type TaskParentDeleteFieldInput = {
  delete?: InputMaybe<StoryDeleteInput>;
  where?: InputMaybe<TaskParentConnectionWhere>;
};

export type TaskParentFieldInput = {
  create?: InputMaybe<TaskParentCreateFieldInput>;
};

export type TaskParentRelationship = {
  __typename?: 'TaskParentRelationship';
  cursor: Scalars['String']['output'];
  node: Story;
};

export type TaskRelationshipFilters = {
  /** Filter type where all of the related Tasks match this filter */
  all?: InputMaybe<TaskWhere>;
  /** Filter type where none of the related Tasks match this filter */
  none?: InputMaybe<TaskWhere>;
  /** Filter type where one of the related Tasks match this filter */
  single?: InputMaybe<TaskWhere>;
  /** Filter type where some of the related Tasks match this filter */
  some?: InputMaybe<TaskWhere>;
};

/** Fields to sort Tasks by. The order in which sorts are applied is not guaranteed when specifying many fields in one TaskSort object. */
export type TaskSort = {
  body?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export enum TaskStatus {
  Blocked = 'BLOCKED',
  Done = 'DONE',
  InProgress = 'IN_PROGRESS',
  Todo = 'TODO'
}

/** TaskStatus filters */
export type TaskStatusEnumScalarFilters = {
  eq?: InputMaybe<TaskStatus>;
  in?: InputMaybe<Array<TaskStatus>>;
};

/** TaskStatus mutations */
export type TaskStatusEnumScalarMutations = {
  set?: InputMaybe<TaskStatus>;
};

export type TaskSummary = {
  __typename?: 'TaskSummary';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: TaskStatus;
};

export type TaskUpdateInput = {
  body?: InputMaybe<StringScalarMutations>;
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  status?: InputMaybe<TaskStatusEnumScalarMutations>;
};

export type TaskWhere = {
  AND?: InputMaybe<Array<TaskWhere>>;
  NOT?: InputMaybe<TaskWhere>;
  OR?: InputMaybe<Array<TaskWhere>>;
  body?: InputMaybe<StringScalarFilters>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  domain?: InputMaybe<DomainWhere>;
  domainConnection?: InputMaybe<TaskDomainConnectionWhere>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  parent?: InputMaybe<StoryWhere>;
  parentConnection?: InputMaybe<TaskParentConnectionWhere>;
  status?: InputMaybe<TaskStatusEnumScalarFilters>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
  workstream?: InputMaybe<DevWorkstreamWhere>;
  workstreamConnection?: InputMaybe<TaskWorkstreamConnectionWhere>;
};

export type TaskWorkstreamConnection = {
  __typename?: 'TaskWorkstreamConnection';
  edges: Array<TaskWorkstreamRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TaskWorkstreamConnectionWhere = {
  AND?: InputMaybe<Array<TaskWorkstreamConnectionWhere>>;
  NOT?: InputMaybe<TaskWorkstreamConnectionWhere>;
  OR?: InputMaybe<Array<TaskWorkstreamConnectionWhere>>;
  node?: InputMaybe<DevWorkstreamWhere>;
};

export type TaskWorkstreamCreateFieldInput = {
  node: DevWorkstreamCreateInput;
};

export type TaskWorkstreamDeleteFieldInput = {
  delete?: InputMaybe<DevWorkstreamDeleteInput>;
  where?: InputMaybe<TaskWorkstreamConnectionWhere>;
};

export type TaskWorkstreamFieldInput = {
  create?: InputMaybe<TaskWorkstreamCreateFieldInput>;
};

export type TaskWorkstreamRelationship = {
  __typename?: 'TaskWorkstreamRelationship';
  cursor: Scalars['String']['output'];
  node: DevWorkstream;
};

export type TasksConnection = {
  __typename?: 'TasksConnection';
  aggregate: TaskAggregate;
  edges: Array<TaskEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UntestedAssumptionWithContext = {
  __typename?: 'UntestedAssumptionWithContext';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  evidence: AssumptionEvidence;
  id: Scalars['ID']['output'];
  importance: AssumptionImportance;
  name: Scalars['String']['output'];
  parentIdea?: Maybe<ParentIdeaRef>;
  status: AssumptionStatus;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type UpdateAdrsMutationResponse = {
  __typename?: 'UpdateAdrsMutationResponse';
  adrs: Array<Adr>;
  info: UpdateInfo;
};

export type UpdateAssumptionsMutationResponse = {
  __typename?: 'UpdateAssumptionsMutationResponse';
  assumptions: Array<Assumption>;
  info: UpdateInfo;
};

export type UpdateBugsMutationResponse = {
  __typename?: 'UpdateBugsMutationResponse';
  bugs: Array<Bug>;
  info: UpdateInfo;
};

export type UpdateChoresMutationResponse = {
  __typename?: 'UpdateChoresMutationResponse';
  chores: Array<Chore>;
  info: UpdateInfo;
};

export type UpdateDevMilestonesMutationResponse = {
  __typename?: 'UpdateDevMilestonesMutationResponse';
  devMilestones: Array<DevMilestone>;
  info: UpdateInfo;
};

export type UpdateDevWorkstreamsMutationResponse = {
  __typename?: 'UpdateDevWorkstreamsMutationResponse';
  devWorkstreams: Array<DevWorkstream>;
  info: UpdateInfo;
};

export type UpdateDomainsMutationResponse = {
  __typename?: 'UpdateDomainsMutationResponse';
  domains: Array<Domain>;
  info: UpdateInfo;
};

export type UpdateEnhancementsMutationResponse = {
  __typename?: 'UpdateEnhancementsMutationResponse';
  enhancements: Array<Enhancement>;
  info: UpdateInfo;
};

export type UpdateEpicsMutationResponse = {
  __typename?: 'UpdateEpicsMutationResponse';
  epics: Array<Epic>;
  info: UpdateInfo;
};

export type UpdateExperimentsMutationResponse = {
  __typename?: 'UpdateExperimentsMutationResponse';
  experiments: Array<Experiment>;
  info: UpdateInfo;
};

export type UpdateIdeasMutationResponse = {
  __typename?: 'UpdateIdeasMutationResponse';
  ideas: Array<Idea>;
  info: UpdateInfo;
};

/** Information about the number of nodes and relationships created and deleted during an update mutation */
export type UpdateInfo = {
  __typename?: 'UpdateInfo';
  nodesCreated: Scalars['Int']['output'];
  nodesDeleted: Scalars['Int']['output'];
  relationshipsCreated: Scalars['Int']['output'];
  relationshipsDeleted: Scalars['Int']['output'];
};

export type UpdateInitiativesMutationResponse = {
  __typename?: 'UpdateInitiativesMutationResponse';
  info: UpdateInfo;
  initiatives: Array<Initiative>;
};

export type UpdateObjectivesMutationResponse = {
  __typename?: 'UpdateObjectivesMutationResponse';
  info: UpdateInfo;
  objectives: Array<Objective>;
};

export type UpdateOpportunitiesMutationResponse = {
  __typename?: 'UpdateOpportunitiesMutationResponse';
  info: UpdateInfo;
  opportunities: Array<Opportunity>;
};

export type UpdateOrganizationsMutationResponse = {
  __typename?: 'UpdateOrganizationsMutationResponse';
  info: UpdateInfo;
  organizations: Array<Organization>;
};

export type UpdateProjectsMutationResponse = {
  __typename?: 'UpdateProjectsMutationResponse';
  info: UpdateInfo;
  projects: Array<Project>;
};

export type UpdateSpecsMutationResponse = {
  __typename?: 'UpdateSpecsMutationResponse';
  info: UpdateInfo;
  specs: Array<Spec>;
};

export type UpdateSpikesMutationResponse = {
  __typename?: 'UpdateSpikesMutationResponse';
  info: UpdateInfo;
  spikes: Array<Spike>;
};

export type UpdateStoriesMutationResponse = {
  __typename?: 'UpdateStoriesMutationResponse';
  info: UpdateInfo;
  stories: Array<Story>;
};

export type UpdateTasksMutationResponse = {
  __typename?: 'UpdateTasksMutationResponse';
  info: UpdateInfo;
  tasks: Array<Task>;
};

export type UpdateUsersMutationResponse = {
  __typename?: 'UpdateUsersMutationResponse';
  info: UpdateInfo;
  users: Array<User>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  displayName: Scalars['String']['output'];
  domains: Array<Domain>;
  domainsConnection: UserDomainsConnection;
  email: Scalars['String']['output'];
  externalId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  organization?: Maybe<Organization>;
  organizationConnection: UserOrganizationConnection;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type UserDomainsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<DomainSort>>;
  where?: InputMaybe<DomainWhere>;
};


export type UserDomainsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<UserDomainsConnectionSort>>;
  where?: InputMaybe<UserDomainsConnectionWhere>;
};

export type UserAggregate = {
  __typename?: 'UserAggregate';
  count: Count;
  node: UserAggregateNode;
};

export type UserAggregateNode = {
  __typename?: 'UserAggregateNode';
  createdAt: DateTimeAggregateSelection;
  displayName: StringAggregateSelection;
  email: StringAggregateSelection;
  externalId: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type UserConnectInput = {
  domains?: InputMaybe<Array<UserDomainsConnectFieldInput>>;
};

export type UserConnectWhere = {
  node: UserWhere;
};

export type UserCreateInput = {
  displayName: Scalars['String']['input'];
  domains?: InputMaybe<UserDomainsFieldInput>;
  email: Scalars['String']['input'];
  externalId?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<UserOrganizationFieldInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UserDeleteInput = {
  domains?: InputMaybe<Array<UserDomainsDeleteFieldInput>>;
  organization?: InputMaybe<UserOrganizationDeleteFieldInput>;
};

export type UserDisconnectInput = {
  domains?: InputMaybe<Array<UserDomainsDisconnectFieldInput>>;
};

export type UserDomainDomainsAggregateSelection = {
  __typename?: 'UserDomainDomainsAggregateSelection';
  count: CountConnection;
  edge?: Maybe<UserDomainDomainsEdgeAggregateSelection>;
  node?: Maybe<UserDomainDomainsNodeAggregateSelection>;
};

export type UserDomainDomainsEdgeAggregateSelection = {
  __typename?: 'UserDomainDomainsEdgeAggregateSelection';
  joinedAt: DateTimeAggregateSelection;
  role: StringAggregateSelection;
};

export type UserDomainDomainsNodeAggregateSelection = {
  __typename?: 'UserDomainDomainsNodeAggregateSelection';
  createdAt: DateTimeAggregateSelection;
  name: StringAggregateSelection;
  slug: StringAggregateSelection;
  updatedAt: DateTimeAggregateSelection;
};

export type UserDomainsAggregateInput = {
  AND?: InputMaybe<Array<UserDomainsAggregateInput>>;
  NOT?: InputMaybe<UserDomainsAggregateInput>;
  OR?: InputMaybe<Array<UserDomainsAggregateInput>>;
  count?: InputMaybe<IntScalarFilters>;
  edge?: InputMaybe<MemberOfPropertiesAggregationWhereInput>;
  node?: InputMaybe<UserDomainsNodeAggregationWhereInput>;
};

export type UserDomainsConnectFieldInput = {
  connect?: InputMaybe<Array<DomainConnectInput>>;
  edge: MemberOfPropertiesCreateInput;
  where?: InputMaybe<DomainConnectWhere>;
};

export type UserDomainsConnection = {
  __typename?: 'UserDomainsConnection';
  aggregate: UserDomainDomainsAggregateSelection;
  edges: Array<UserDomainsRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserDomainsConnectionAggregateInput = {
  AND?: InputMaybe<Array<UserDomainsConnectionAggregateInput>>;
  NOT?: InputMaybe<UserDomainsConnectionAggregateInput>;
  OR?: InputMaybe<Array<UserDomainsConnectionAggregateInput>>;
  count?: InputMaybe<ConnectionAggregationCountFilterInput>;
  edge?: InputMaybe<MemberOfPropertiesAggregationWhereInput>;
  node?: InputMaybe<UserDomainsNodeAggregationWhereInput>;
};

export type UserDomainsConnectionFilters = {
  /** Filter Users by aggregating results on related UserDomainsConnections */
  aggregate?: InputMaybe<UserDomainsConnectionAggregateInput>;
  /** Return Users where all of the related UserDomainsConnections match this filter */
  all?: InputMaybe<UserDomainsConnectionWhere>;
  /** Return Users where none of the related UserDomainsConnections match this filter */
  none?: InputMaybe<UserDomainsConnectionWhere>;
  /** Return Users where one of the related UserDomainsConnections match this filter */
  single?: InputMaybe<UserDomainsConnectionWhere>;
  /** Return Users where some of the related UserDomainsConnections match this filter */
  some?: InputMaybe<UserDomainsConnectionWhere>;
};

export type UserDomainsConnectionSort = {
  edge?: InputMaybe<MemberOfPropertiesSort>;
  node?: InputMaybe<DomainSort>;
};

export type UserDomainsConnectionWhere = {
  AND?: InputMaybe<Array<UserDomainsConnectionWhere>>;
  NOT?: InputMaybe<UserDomainsConnectionWhere>;
  OR?: InputMaybe<Array<UserDomainsConnectionWhere>>;
  edge?: InputMaybe<MemberOfPropertiesWhere>;
  node?: InputMaybe<DomainWhere>;
};

export type UserDomainsCreateFieldInput = {
  edge: MemberOfPropertiesCreateInput;
  node: DomainCreateInput;
};

export type UserDomainsDeleteFieldInput = {
  delete?: InputMaybe<DomainDeleteInput>;
  where?: InputMaybe<UserDomainsConnectionWhere>;
};

export type UserDomainsDisconnectFieldInput = {
  disconnect?: InputMaybe<DomainDisconnectInput>;
  where?: InputMaybe<UserDomainsConnectionWhere>;
};

export type UserDomainsFieldInput = {
  connect?: InputMaybe<Array<UserDomainsConnectFieldInput>>;
  create?: InputMaybe<Array<UserDomainsCreateFieldInput>>;
};

export type UserDomainsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<UserDomainsNodeAggregationWhereInput>>;
  NOT?: InputMaybe<UserDomainsNodeAggregationWhereInput>;
  OR?: InputMaybe<Array<UserDomainsNodeAggregationWhereInput>>;
  apiKey?: InputMaybe<StringScalarAggregationFilters>;
  createdAt?: InputMaybe<DateTimeScalarAggregationFilters>;
  name?: InputMaybe<StringScalarAggregationFilters>;
  slug?: InputMaybe<StringScalarAggregationFilters>;
  updatedAt?: InputMaybe<DateTimeScalarAggregationFilters>;
};

export type UserDomainsRelationship = {
  __typename?: 'UserDomainsRelationship';
  cursor: Scalars['String']['output'];
  node: Domain;
  properties: MemberOfProperties;
};

export type UserDomainsUpdateConnectionInput = {
  edge?: InputMaybe<MemberOfPropertiesUpdateInput>;
  node?: InputMaybe<DomainUpdateInput>;
  where?: InputMaybe<UserDomainsConnectionWhere>;
};

export type UserDomainsUpdateFieldInput = {
  connect?: InputMaybe<Array<UserDomainsConnectFieldInput>>;
  create?: InputMaybe<Array<UserDomainsCreateFieldInput>>;
  delete?: InputMaybe<Array<UserDomainsDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<UserDomainsDisconnectFieldInput>>;
  update?: InputMaybe<UserDomainsUpdateConnectionInput>;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node: User;
};

export type UserOrganizationConnection = {
  __typename?: 'UserOrganizationConnection';
  edges: Array<UserOrganizationRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserOrganizationConnectionWhere = {
  AND?: InputMaybe<Array<UserOrganizationConnectionWhere>>;
  NOT?: InputMaybe<UserOrganizationConnectionWhere>;
  OR?: InputMaybe<Array<UserOrganizationConnectionWhere>>;
  node?: InputMaybe<OrganizationWhere>;
};

export type UserOrganizationCreateFieldInput = {
  node: OrganizationCreateInput;
};

export type UserOrganizationDeleteFieldInput = {
  delete?: InputMaybe<OrganizationDeleteInput>;
  where?: InputMaybe<UserOrganizationConnectionWhere>;
};

export type UserOrganizationFieldInput = {
  create?: InputMaybe<UserOrganizationCreateFieldInput>;
};

export type UserOrganizationRelationship = {
  __typename?: 'UserOrganizationRelationship';
  cursor: Scalars['String']['output'];
  node: Organization;
};

export type UserRelationshipFilters = {
  /** Filter type where all of the related Users match this filter */
  all?: InputMaybe<UserWhere>;
  /** Filter type where none of the related Users match this filter */
  none?: InputMaybe<UserWhere>;
  /** Filter type where one of the related Users match this filter */
  single?: InputMaybe<UserWhere>;
  /** Filter type where some of the related Users match this filter */
  some?: InputMaybe<UserWhere>;
};

/** Fields to sort Users by. The order in which sorts are applied is not guaranteed when specifying many fields in one UserSort object. */
export type UserSort = {
  createdAt?: InputMaybe<SortDirection>;
  displayName?: InputMaybe<SortDirection>;
  email?: InputMaybe<SortDirection>;
  externalId?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export type UserUpdateInput = {
  createdAt?: InputMaybe<DateTimeScalarMutations>;
  displayName?: InputMaybe<StringScalarMutations>;
  domains?: InputMaybe<Array<UserDomainsUpdateFieldInput>>;
  email?: InputMaybe<StringScalarMutations>;
  externalId?: InputMaybe<StringScalarMutations>;
};

export type UserWhere = {
  AND?: InputMaybe<Array<UserWhere>>;
  NOT?: InputMaybe<UserWhere>;
  OR?: InputMaybe<Array<UserWhere>>;
  createdAt?: InputMaybe<DateTimeScalarFilters>;
  displayName?: InputMaybe<StringScalarFilters>;
  domains?: InputMaybe<DomainRelationshipFilters>;
  domainsConnection?: InputMaybe<UserDomainsConnectionFilters>;
  email?: InputMaybe<StringScalarFilters>;
  externalId?: InputMaybe<StringScalarFilters>;
  id?: InputMaybe<IdScalarFilters>;
  organization?: InputMaybe<OrganizationWhere>;
  organizationConnection?: InputMaybe<UserOrganizationConnectionWhere>;
  updatedAt?: InputMaybe<DateTimeScalarFilters>;
};

export type UsersConnection = {
  __typename?: 'UsersConnection';
  aggregate: UserAggregate;
  edges: Array<UserEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TestQueryVariables = Exact<{ [key: string]: never; }>;


export type TestQuery = { __typename?: 'Query', objectives: Array<{ __typename?: 'Objective', id: string }> };

export type SentinelQueryVariables = Exact<{ [key: string]: never; }>;


export type SentinelQuery = { __typename?: 'Query', objectives: Array<{ __typename?: 'Objective', id: string }> };


export const TestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Test"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objectives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TestQuery, TestQueryVariables>;
export const SentinelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sentinel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objectives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SentinelQuery, SentinelQueryVariables>;