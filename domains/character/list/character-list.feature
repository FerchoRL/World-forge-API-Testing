@api @character @list
Feature: Character – List (GET /characters)

  Background:
    Given the Character service is available

@tc-char-list-01
  Scenario: TC-CHAR-LIST-01 – Default pagination – Returns first page
    When I request the list of characters without pagination parameters
    Then the response should contain the default pagination values for character list
