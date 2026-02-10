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

  @tc-char-list-limit-normalization
  Scenario Outline: Character list normalizes invalid limit values
    When I request the list of characters with limit <limit>
    Then the response should apply limit <expectedLimit>

    Examples:
      | limit | expectedLimit |
      |   100 |            50 |
      |     0 |            10 |
      |    -5 |            10 |
      | abc   |            10 |
      | false |            10 |

  @tc-char-list-page-normalization
  Scenario Outline: Character list normalizes invalid page values
    When I request the list of characters with page <page>
    Then the response should default the page to 1

    Examples:
      | page |
      |    0 |
      |   -3 |
      | abc  |

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
