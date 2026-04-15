/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n        query Test {\n          objectives {\n            id\n          }\n        }\n      ": typeof types.TestDocument,
    "query AssumptionDetail($id: ID!) {\n  assumptions(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    importance\n    evidence\n    body\n    createdAt\n    updatedAt\n    assumedBy {\n      id\n      name\n      status\n    }\n    testedBy {\n      id\n      name\n      status\n      method\n      result\n    }\n  }\n}": typeof types.AssumptionDetailDocument,
    "query DiscoveryHealth($domainSlug: String!) {\n  discoveryHealth(domainSlug: $domainSlug) {\n    totalObjectives\n    totalOpportunities\n    totalIdeas\n    totalAssumptions\n    totalExperiments\n    untestedHighImportanceAssumptions\n    ideasWithNoAssumptions\n    orphanedOpportunities\n  }\n}": typeof types.DiscoveryHealthDocument,
    "query ExperimentDetail($id: ID!) {\n  experiments(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    method\n    successCriteria\n    duration\n    effort\n    result\n    learnings\n    body\n    createdAt\n    updatedAt\n    tests {\n      id\n      name\n      status\n      importance\n    }\n  }\n}": typeof types.ExperimentDetailDocument,
    "query IdeaDetail($id: ID!) {\n  ideas(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    body\n    createdAt\n    updatedAt\n    addresses {\n      id\n      name\n      status\n    }\n    assumptions {\n      id\n      name\n      status\n      importance\n    }\n  }\n}": typeof types.IdeaDetailDocument,
    "query ObjectiveDetail($id: ID!) {\n  objectives(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    body\n    createdAt\n    updatedAt\n    supportedBy {\n      id\n      name\n      status\n    }\n  }\n}": typeof types.ObjectiveDetailDocument,
    "query ObjectiveSubgraph($objectiveId: ID!, $domainSlug: String!) {\n  objectiveSubgraph(objectiveId: $objectiveId, domainSlug: $domainSlug) {\n    id\n    name\n    status\n    opportunities {\n      id\n      name\n      status\n      hmw\n      ideas {\n        id\n        name\n        status\n        assumptions {\n          id\n          name\n          status\n          importance\n          evidence\n          experiments {\n            id\n            name\n            status\n            method\n            result\n          }\n        }\n      }\n    }\n  }\n}": typeof types.ObjectiveSubgraphDocument,
    "query ObjectivesWithOpportunities($domainSlug: String!) {\n  objectives(where: {domain: {slug: {eq: $domainSlug}}}) {\n    id\n    name\n    status\n    supportedBy {\n      id\n      name\n      status\n      hmw\n    }\n  }\n}": typeof types.ObjectivesWithOpportunitiesDocument,
    "query OpportunityDetail($id: ID!) {\n  opportunities(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    hmw\n    body\n    createdAt\n    updatedAt\n    supports {\n      id\n      name\n      status\n    }\n    addressedBy {\n      id\n      name\n      status\n    }\n  }\n}": typeof types.OpportunityDetailDocument,
    "query OpportunitySubgraph($opportunityId: ID!, $domainSlug: String!) {\n  opportunitySubgraph(opportunityId: $opportunityId, domainSlug: $domainSlug) {\n    id\n    name\n    status\n    hmw\n    ideas {\n      id\n      name\n      status\n      assumptions {\n        id\n        name\n        status\n        importance\n        evidence\n        experiments {\n          id\n          name\n          status\n          method\n          result\n        }\n      }\n    }\n  }\n}": typeof types.OpportunitySubgraphDocument,
    "query OrphanedOpportunities($domainSlug: String!) {\n  orphanedOpportunities(domainSlug: $domainSlug) {\n    id\n    name\n    status\n    hmw\n  }\n}": typeof types.OrphanedOpportunitiesDocument,
    "query Sentinel {\n  objectives {\n    id\n  }\n}": typeof types.SentinelDocument,
    "query UnrootedAssumptions($domainSlug: String!) {\n  unrootedAssumptions(domainSlug: $domainSlug) {\n    id\n    name\n    status\n    importance\n  }\n}": typeof types.UnrootedAssumptionsDocument,
    "query UnrootedIdeas($domainSlug: String!) {\n  unrootedIdeas(domainSlug: $domainSlug) {\n    id\n    name\n    status\n  }\n}": typeof types.UnrootedIdeasDocument,
    "query UntestedAssumptions($domainSlug: String!, $minImportance: String) {\n  untestedAssumptions(domainSlug: $domainSlug, minImportance: $minImportance) {\n    id\n    name\n    status\n    importance\n    evidence\n    body\n    parentIdea {\n      id\n      name\n      status\n    }\n  }\n}": typeof types.UntestedAssumptionsDocument,
};
const documents: Documents = {
    "\n        query Test {\n          objectives {\n            id\n          }\n        }\n      ": types.TestDocument,
    "query AssumptionDetail($id: ID!) {\n  assumptions(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    importance\n    evidence\n    body\n    createdAt\n    updatedAt\n    assumedBy {\n      id\n      name\n      status\n    }\n    testedBy {\n      id\n      name\n      status\n      method\n      result\n    }\n  }\n}": types.AssumptionDetailDocument,
    "query DiscoveryHealth($domainSlug: String!) {\n  discoveryHealth(domainSlug: $domainSlug) {\n    totalObjectives\n    totalOpportunities\n    totalIdeas\n    totalAssumptions\n    totalExperiments\n    untestedHighImportanceAssumptions\n    ideasWithNoAssumptions\n    orphanedOpportunities\n  }\n}": types.DiscoveryHealthDocument,
    "query ExperimentDetail($id: ID!) {\n  experiments(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    method\n    successCriteria\n    duration\n    effort\n    result\n    learnings\n    body\n    createdAt\n    updatedAt\n    tests {\n      id\n      name\n      status\n      importance\n    }\n  }\n}": types.ExperimentDetailDocument,
    "query IdeaDetail($id: ID!) {\n  ideas(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    body\n    createdAt\n    updatedAt\n    addresses {\n      id\n      name\n      status\n    }\n    assumptions {\n      id\n      name\n      status\n      importance\n    }\n  }\n}": types.IdeaDetailDocument,
    "query ObjectiveDetail($id: ID!) {\n  objectives(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    body\n    createdAt\n    updatedAt\n    supportedBy {\n      id\n      name\n      status\n    }\n  }\n}": types.ObjectiveDetailDocument,
    "query ObjectiveSubgraph($objectiveId: ID!, $domainSlug: String!) {\n  objectiveSubgraph(objectiveId: $objectiveId, domainSlug: $domainSlug) {\n    id\n    name\n    status\n    opportunities {\n      id\n      name\n      status\n      hmw\n      ideas {\n        id\n        name\n        status\n        assumptions {\n          id\n          name\n          status\n          importance\n          evidence\n          experiments {\n            id\n            name\n            status\n            method\n            result\n          }\n        }\n      }\n    }\n  }\n}": types.ObjectiveSubgraphDocument,
    "query ObjectivesWithOpportunities($domainSlug: String!) {\n  objectives(where: {domain: {slug: {eq: $domainSlug}}}) {\n    id\n    name\n    status\n    supportedBy {\n      id\n      name\n      status\n      hmw\n    }\n  }\n}": types.ObjectivesWithOpportunitiesDocument,
    "query OpportunityDetail($id: ID!) {\n  opportunities(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    hmw\n    body\n    createdAt\n    updatedAt\n    supports {\n      id\n      name\n      status\n    }\n    addressedBy {\n      id\n      name\n      status\n    }\n  }\n}": types.OpportunityDetailDocument,
    "query OpportunitySubgraph($opportunityId: ID!, $domainSlug: String!) {\n  opportunitySubgraph(opportunityId: $opportunityId, domainSlug: $domainSlug) {\n    id\n    name\n    status\n    hmw\n    ideas {\n      id\n      name\n      status\n      assumptions {\n        id\n        name\n        status\n        importance\n        evidence\n        experiments {\n          id\n          name\n          status\n          method\n          result\n        }\n      }\n    }\n  }\n}": types.OpportunitySubgraphDocument,
    "query OrphanedOpportunities($domainSlug: String!) {\n  orphanedOpportunities(domainSlug: $domainSlug) {\n    id\n    name\n    status\n    hmw\n  }\n}": types.OrphanedOpportunitiesDocument,
    "query Sentinel {\n  objectives {\n    id\n  }\n}": types.SentinelDocument,
    "query UnrootedAssumptions($domainSlug: String!) {\n  unrootedAssumptions(domainSlug: $domainSlug) {\n    id\n    name\n    status\n    importance\n  }\n}": types.UnrootedAssumptionsDocument,
    "query UnrootedIdeas($domainSlug: String!) {\n  unrootedIdeas(domainSlug: $domainSlug) {\n    id\n    name\n    status\n  }\n}": types.UnrootedIdeasDocument,
    "query UntestedAssumptions($domainSlug: String!, $minImportance: String) {\n  untestedAssumptions(domainSlug: $domainSlug, minImportance: $minImportance) {\n    id\n    name\n    status\n    importance\n    evidence\n    body\n    parentIdea {\n      id\n      name\n      status\n    }\n  }\n}": types.UntestedAssumptionsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        query Test {\n          objectives {\n            id\n          }\n        }\n      "): (typeof documents)["\n        query Test {\n          objectives {\n            id\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query AssumptionDetail($id: ID!) {\n  assumptions(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    importance\n    evidence\n    body\n    createdAt\n    updatedAt\n    assumedBy {\n      id\n      name\n      status\n    }\n    testedBy {\n      id\n      name\n      status\n      method\n      result\n    }\n  }\n}"): (typeof documents)["query AssumptionDetail($id: ID!) {\n  assumptions(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    importance\n    evidence\n    body\n    createdAt\n    updatedAt\n    assumedBy {\n      id\n      name\n      status\n    }\n    testedBy {\n      id\n      name\n      status\n      method\n      result\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query DiscoveryHealth($domainSlug: String!) {\n  discoveryHealth(domainSlug: $domainSlug) {\n    totalObjectives\n    totalOpportunities\n    totalIdeas\n    totalAssumptions\n    totalExperiments\n    untestedHighImportanceAssumptions\n    ideasWithNoAssumptions\n    orphanedOpportunities\n  }\n}"): (typeof documents)["query DiscoveryHealth($domainSlug: String!) {\n  discoveryHealth(domainSlug: $domainSlug) {\n    totalObjectives\n    totalOpportunities\n    totalIdeas\n    totalAssumptions\n    totalExperiments\n    untestedHighImportanceAssumptions\n    ideasWithNoAssumptions\n    orphanedOpportunities\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ExperimentDetail($id: ID!) {\n  experiments(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    method\n    successCriteria\n    duration\n    effort\n    result\n    learnings\n    body\n    createdAt\n    updatedAt\n    tests {\n      id\n      name\n      status\n      importance\n    }\n  }\n}"): (typeof documents)["query ExperimentDetail($id: ID!) {\n  experiments(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    method\n    successCriteria\n    duration\n    effort\n    result\n    learnings\n    body\n    createdAt\n    updatedAt\n    tests {\n      id\n      name\n      status\n      importance\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query IdeaDetail($id: ID!) {\n  ideas(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    body\n    createdAt\n    updatedAt\n    addresses {\n      id\n      name\n      status\n    }\n    assumptions {\n      id\n      name\n      status\n      importance\n    }\n  }\n}"): (typeof documents)["query IdeaDetail($id: ID!) {\n  ideas(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    body\n    createdAt\n    updatedAt\n    addresses {\n      id\n      name\n      status\n    }\n    assumptions {\n      id\n      name\n      status\n      importance\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ObjectiveDetail($id: ID!) {\n  objectives(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    body\n    createdAt\n    updatedAt\n    supportedBy {\n      id\n      name\n      status\n    }\n  }\n}"): (typeof documents)["query ObjectiveDetail($id: ID!) {\n  objectives(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    body\n    createdAt\n    updatedAt\n    supportedBy {\n      id\n      name\n      status\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ObjectiveSubgraph($objectiveId: ID!, $domainSlug: String!) {\n  objectiveSubgraph(objectiveId: $objectiveId, domainSlug: $domainSlug) {\n    id\n    name\n    status\n    opportunities {\n      id\n      name\n      status\n      hmw\n      ideas {\n        id\n        name\n        status\n        assumptions {\n          id\n          name\n          status\n          importance\n          evidence\n          experiments {\n            id\n            name\n            status\n            method\n            result\n          }\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query ObjectiveSubgraph($objectiveId: ID!, $domainSlug: String!) {\n  objectiveSubgraph(objectiveId: $objectiveId, domainSlug: $domainSlug) {\n    id\n    name\n    status\n    opportunities {\n      id\n      name\n      status\n      hmw\n      ideas {\n        id\n        name\n        status\n        assumptions {\n          id\n          name\n          status\n          importance\n          evidence\n          experiments {\n            id\n            name\n            status\n            method\n            result\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ObjectivesWithOpportunities($domainSlug: String!) {\n  objectives(where: {domain: {slug: {eq: $domainSlug}}}) {\n    id\n    name\n    status\n    supportedBy {\n      id\n      name\n      status\n      hmw\n    }\n  }\n}"): (typeof documents)["query ObjectivesWithOpportunities($domainSlug: String!) {\n  objectives(where: {domain: {slug: {eq: $domainSlug}}}) {\n    id\n    name\n    status\n    supportedBy {\n      id\n      name\n      status\n      hmw\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query OpportunityDetail($id: ID!) {\n  opportunities(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    hmw\n    body\n    createdAt\n    updatedAt\n    supports {\n      id\n      name\n      status\n    }\n    addressedBy {\n      id\n      name\n      status\n    }\n  }\n}"): (typeof documents)["query OpportunityDetail($id: ID!) {\n  opportunities(where: {id: {eq: $id}}) {\n    id\n    name\n    status\n    hmw\n    body\n    createdAt\n    updatedAt\n    supports {\n      id\n      name\n      status\n    }\n    addressedBy {\n      id\n      name\n      status\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query OpportunitySubgraph($opportunityId: ID!, $domainSlug: String!) {\n  opportunitySubgraph(opportunityId: $opportunityId, domainSlug: $domainSlug) {\n    id\n    name\n    status\n    hmw\n    ideas {\n      id\n      name\n      status\n      assumptions {\n        id\n        name\n        status\n        importance\n        evidence\n        experiments {\n          id\n          name\n          status\n          method\n          result\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query OpportunitySubgraph($opportunityId: ID!, $domainSlug: String!) {\n  opportunitySubgraph(opportunityId: $opportunityId, domainSlug: $domainSlug) {\n    id\n    name\n    status\n    hmw\n    ideas {\n      id\n      name\n      status\n      assumptions {\n        id\n        name\n        status\n        importance\n        evidence\n        experiments {\n          id\n          name\n          status\n          method\n          result\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query OrphanedOpportunities($domainSlug: String!) {\n  orphanedOpportunities(domainSlug: $domainSlug) {\n    id\n    name\n    status\n    hmw\n  }\n}"): (typeof documents)["query OrphanedOpportunities($domainSlug: String!) {\n  orphanedOpportunities(domainSlug: $domainSlug) {\n    id\n    name\n    status\n    hmw\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Sentinel {\n  objectives {\n    id\n  }\n}"): (typeof documents)["query Sentinel {\n  objectives {\n    id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query UnrootedAssumptions($domainSlug: String!) {\n  unrootedAssumptions(domainSlug: $domainSlug) {\n    id\n    name\n    status\n    importance\n  }\n}"): (typeof documents)["query UnrootedAssumptions($domainSlug: String!) {\n  unrootedAssumptions(domainSlug: $domainSlug) {\n    id\n    name\n    status\n    importance\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query UnrootedIdeas($domainSlug: String!) {\n  unrootedIdeas(domainSlug: $domainSlug) {\n    id\n    name\n    status\n  }\n}"): (typeof documents)["query UnrootedIdeas($domainSlug: String!) {\n  unrootedIdeas(domainSlug: $domainSlug) {\n    id\n    name\n    status\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query UntestedAssumptions($domainSlug: String!, $minImportance: String) {\n  untestedAssumptions(domainSlug: $domainSlug, minImportance: $minImportance) {\n    id\n    name\n    status\n    importance\n    evidence\n    body\n    parentIdea {\n      id\n      name\n      status\n    }\n  }\n}"): (typeof documents)["query UntestedAssumptions($domainSlug: String!, $minImportance: String) {\n  untestedAssumptions(domainSlug: $domainSlug, minImportance: $minImportance) {\n    id\n    name\n    status\n    importance\n    evidence\n    body\n    parentIdea {\n      id\n      name\n      status\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;