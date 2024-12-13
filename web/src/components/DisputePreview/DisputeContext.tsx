import React from "react";
import styled from "styled-components";

import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { INVALID_DISPUTE_DATA_ERROR, RPC_ERROR } from "consts/index";
import { Answer as IAnswer } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";

import { responsiveSize } from "styles/responsiveSize";

import ReactMarkdown from "components/ReactMarkdown";
import { StyledSkeleton } from "components/StyledSkeleton";

import AliasDisplay from "./Alias";
import { Divider } from "../Divider";
import { ExternalLink } from "../ExternalLink";

const StyledH1 = styled.h1`
  margin: 0;
  word-wrap: break-word;
`;

const ReactMarkdownWrapper = styled.div`
  & p:first-of-type {
    margin: 0;
  }
`;

const VotingOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AnswersContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const AnswersHeader = styled.h3`
  margin: 0;
`;

const Answer = styled.div`
  margin: 0px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const AliasesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${responsiveSize(8, 20)};
`;

interface IDisputeContext {
  disputeDetails?: DisputeDetails;
  isRpcError?: boolean;
}

export const DisputeContext: React.FC<IDisputeContext> = ({ disputeDetails, isRpcError = false }) => {
  const errMsg = isRpcError ? RPC_ERROR : INVALID_DISPUTE_DATA_ERROR;
  return (
    <>
      <StyledH1>{isUndefined(disputeDetails) ? <StyledSkeleton /> : (disputeDetails?.title ?? errMsg)}</StyledH1>
      {!isUndefined(disputeDetails) ? (
        <>
          {disputeDetails?.question?.trim() ? (
            <ReactMarkdownWrapper>
              <ReactMarkdown>{disputeDetails.question}</ReactMarkdown>
            </ReactMarkdownWrapper>
          ) : null}
          {disputeDetails?.description?.trim() ? (
            <ReactMarkdownWrapper>
              <ReactMarkdown>{disputeDetails.description}</ReactMarkdown>
            </ReactMarkdownWrapper>
          ) : null}
        </>
      ) : null}

      {isUndefined(disputeDetails?.frontendUrl) ? null : (
        <ExternalLink href={disputeDetails?.frontendUrl} target="_blank" rel="noreferrer">
          Go to arbitrable
        </ExternalLink>
      )}
      <VotingOptions>
        {isUndefined(disputeDetails) ? null : <AnswersHeader>Voting Options</AnswersHeader>}
        <AnswersContainer>
          {disputeDetails?.answers?.map((answer: IAnswer, i: number) => (
            <Answer key={answer.title}>
              <small>
                <label>{i + 1}.</label> {answer.title}
                {answer.description.trim() ? ` - ${answer.description}` : null}
              </small>
            </Answer>
          ))}
        </AnswersContainer>
      </VotingOptions>

      {isUndefined(disputeDetails?.aliases) ? null : (
        <>
          <Divider />
          <AliasesContainer>
            {Object.keys(disputeDetails.aliases).map((key) => (
              <AliasDisplay name={key} key={key} address={disputeDetails.aliases[key]} />
            ))}
          </AliasesContainer>
        </>
      )}
    </>
  );
};
