@api @character @list
Feature: Character – List (GET /characters

  Background:
    Given the Character service is available

  @tc-char-list-01
  Scenario: TC-CHAR-LIST-01 – Default pagination – Returns first page
    When I request the list of characters without pagination parameters
    Then the response should contain the default pagination values for character list

  @tc-char-list-02
  Scenario: TC-CHAR-LIST-02 – Valid pagination parameters – Respects page and limit
    When I request the list of characters with page 2 and limit 5
    Then the response should respect the pagination values page 2 and limit 5

  @tc-char-list-03
  Scenario: TC-CHAR-LIST-03 – Limit above max – Caps limit to 50
    When I request the list of characters with limit 999
    Then the response should cap the limit to 50

  @tc-char-list-04-07
  Scenario Outline: TC-CHAR-LIST-04 to 07 – Invalid limit values return 400
    When I request the list of characters with limit <limit>
    Then the response should return a 400 error with message "Limit must be a positive integer"

    Examples:
      | limit | # TC                 |
      |     0 | # TC-04: zero        |
      |    -5 | # TC-05: negative    |
      | abc   | # TC-06: non-numeric |
      | false | # TC-07: boolean     |

  @tc-char-list-08-10
  Scenario Outline: TC-CHAR-LIST-08 to 10.1 – Invalid page values return 400
    When I request the list of characters with page <page>
    Then the response should return a 400 error with message "Page must be a positive integer"

    Examples:
      | page | # TC                 |
      |    0 | # TC-08: zero        |
      |   -3 | # TC-09: negative    |
      | abc  | # TC-10: non-numeric |
      | true | # TC-10.1: boolean   |

  @tc-char-list-11
  Scenario: TC-CHAR-LIST-11 – High page number – Returns empty list
    When I request the list of characters with page 9999
    Then the response should return an empty character list for page 9999

  @tc-char-list-12
  Scenario: TC-CHAR-LIST-12 – Unknown query parameters – Ignored by backend
    When I request the list of characters with unknown query parameters
    Then the response should ignore unknown query parameters
  # TODO:
  # Implement backend support for forcing a 500 error for testing purposes.
  # Suggested approach:
  # - Use an environment variable (e.g. FORCE_CHARACTERS_ERROR=true)
  #   OR
  # - Use a dedicated request header (e.g. x-force-error: characters)
  #
  # This scenario should be enabled once the backend exposes
  # a deterministic way to simulate internal server errors.

  @tc-char-list-13 @error @skip
  Scenario: TC-CHAR-LIST-13 – Internal server error – Returns 500
    When I request the list of characters and an internal error occurs
    Then the response should return a 500 internal server error

  @tc-char-list-14 @contract
  Scenario: TC-CHAR-LIST-14 – Character list returns valid CharacterDTO structure
    When I request the list of characters without pagination parameters
    Then each returned character should match the CharacterDTO contract
