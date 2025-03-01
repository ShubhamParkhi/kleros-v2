import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { Card, CustomAccordion } from "@kleros/ui-components-library";

import { Answer } from "context/NewDisputeContext";
import { DrawnJuror } from "utils/getDrawnJurorsWithCount";
import { getVoteChoice } from "utils/getVoteChoice";
import { isUndefined } from "utils/index";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";

import InfoCard from "components/InfoCard";

import AccordionTitle from "./AccordionTitle";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledAccordion = styled(CustomAccordion)`
  width: 100%;

  [class*="accordion-item"] {
    margin: 0;
  }

  [class*="accordion-button"] {
    padding: 16px !important;
    margin: 4px 0;
  }

  [class*="Body"] {
    padding: 8px;
  }

  ${landscapeStyle(
    () => css`
      [class*="accordion-button"] {
        padding: 12px 16px !important;
      }
      [class*="Body"] {
        padding: 12px 16px;
      }
    `
  )}
`;

const StyledCard = styled(Card)`
  ${hoverShortTransitionTiming}
  width: 100%;
  height: auto;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.stroke};
  margin: 4px 0;

  :hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }

  ${landscapeStyle(
    () => css`
      padding: 12px 16px;
    `
  )}
`;

const AccordionContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LabelWrapper = styled.div`
  display: flex;
  gap: 4px;
`;

const JustificationText = styled.label`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 16px;
  line-height: 1.2;
  flex: 1;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryText};
  font-size: 16px;
`;

const SecondaryTextLabel = styled.label`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 16px;
  flex: 1;
`;

const AccordionContent: React.FC<{
  choice?: string;
  answers: Answer[];
  justification: string;
}> = ({ justification, choice, answers }) => (
  <AccordionContentContainer>
    {!isUndefined(choice) && (
      <LabelWrapper>
        <StyledLabel>Voted:&nbsp;</StyledLabel>
        <SecondaryTextLabel dir="auto">{getVoteChoice(parseInt(choice), answers)}</SecondaryTextLabel>
      </LabelWrapper>
    )}
    {justification ? (
      <LabelWrapper>
        <StyledLabel>Justification:&nbsp;</StyledLabel>
        <JustificationText dir="auto">{justification}</JustificationText>
      </LabelWrapper>
    ) : (
      <SecondaryTextLabel>No justification provided</SecondaryTextLabel>
    )}
  </AccordionContentContainer>
);

interface IVotesAccordion {
  drawnJurors: DrawnJuror[];
  period: string;
  answers: Answer[];
  isActiveRound: boolean;
  hiddenVotes: boolean;
}

const VotesAccordion: React.FC<IVotesAccordion> = ({ drawnJurors, period, answers, isActiveRound, hiddenVotes }) => {
  const accordionItems = useMemo(() => {
    return drawnJurors
      .map((drawnJuror) =>
        !isUndefined(drawnJuror.vote?.justification?.choice)
          ? {
              title: (
                <AccordionTitle
                  juror={drawnJuror.juror.id}
                  voteCount={drawnJuror.voteCount}
                  choice={drawnJuror.vote?.justification?.choice}
                  period={period}
                  answers={answers}
                  isActiveRound={isActiveRound}
                  commited={Boolean(drawnJuror.vote.commited)}
                  hiddenVotes={hiddenVotes}
                />
              ),
              body: (
                <AccordionContent
                  justification={drawnJuror?.vote?.justification.reference ?? ""}
                  choice={drawnJuror.vote?.justification?.choice}
                  answers={answers}
                />
              ),
            }
          : null
      )
      .filter((item) => item !== null);
  }, [drawnJurors, period, answers, isActiveRound, hiddenVotes]);

  return (
    <>
      {drawnJurors.length === 0 ? (
        <>
          <br />
          <InfoCard msg="Jurors have not been drawn yet." />
        </>
      ) : null}
      <Container>
        {accordionItems.length > 0 ? <StyledAccordion items={accordionItems} /> : null}
        {drawnJurors.map(
          (drawnJuror) =>
            isUndefined(drawnJuror.vote?.justification?.choice) && (
              <StyledCard key={drawnJuror.juror.id}>
                <AccordionTitle
                  juror={drawnJuror.juror.id}
                  voteCount={drawnJuror.voteCount}
                  period={period}
                  answers={answers}
                  isActiveRound={isActiveRound}
                  hiddenVotes={hiddenVotes}
                  commited={Boolean(drawnJuror.vote?.commited)}
                />
              </StyledCard>
            )
        )}
      </Container>
    </>
  );
};

export default VotesAccordion;
