@api @universe @universe-list
Feature: Universe - List (GET /universes)

  Background:
    Given the Universe service is available

  @tc-universe-list-01
  Scenario: TC-UNIVERSE-LIST-01 - Default list (no query params)
    When I request the list of universes without pagination parameters
    Then the universe list endpoint should respond with status code 200
    And the response should contain the default pagination values for universe list

  @tc-universe-list-02
  Scenario: TC-UNIVERSE-LIST-02 - List with explicit valid pagination
    When I request the list of universes with page 1 and limit 5
    Then the universe list endpoint should respond with status code 200
    And the universe list response should respect pagination page 1 and limit 5

  @tc-universe-list-03
  Scenario: TC-UNIVERSE-LIST-03 - Limit above max allowed (cap at 50)
    When I request the list of universes with page 1 and limit 999
    Then the universe list endpoint should respond with status code 200
    And the universe list response should cap limit to 50

  @tc-universe-list-04-06
  Scenario Outline: TC-UNIVERSE-LIST-04 to 06 - Invalid page values return 400
    When I request the list of universes with invalid page <page>
    Then the universe list endpoint should respond with status code 400
    And the universe list response error message should be "Page must be a positive integer"

    Examples:
      | page  |
      | 0     |
      | -1    |
      | 1.5   |
      | abc   |
      | false |
      | true  |


  @tc-universe-list-07-09
  Scenario Outline: TC-UNIVERSE-LIST-07 to 09 - Invalid limit values return 400
    When I request the list of universes with invalid limit <limit>
    Then the universe list endpoint should respond with status code 400
    And the universe list response error message should be "Limit must be a positive integer"

    Examples:
      | limit |
      | 0     |
      | -3    |
      | 2.7   |
      | abc   |
      | false |
      | true  |

  @tc-universe-list-11
  Scenario: TC-UNIVERSE-LIST-11 - Out-of-range page (no items)
    When I request the list of universes with page 999 and limit 10
    Then the universe list endpoint should respond with status code 200
    And the universe list response should return an empty universes array for page 999 and limit 10

  @tc-universe-list-12
  Scenario: TC-UNIVERSE-LIST-12 - Unknown query parameters - Ignored by backend
    When I request the list of universes with unknown query parameters
    Then the universe list endpoint should respond with status code 200
    And the universe list response should ignore unknown query parameters

  @tc-universe-list-14 @contract
  Scenario: TC-UNIVERSE-LIST-14 - Universe list returns valid UniverseDTO structure
    When I request the list of universes without pagination parameters
    Then the universe list endpoint should respond with status code 200
    And each returned universe should match the UniverseDTO contract