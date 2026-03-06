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

  @tc-universe-list-04
  Scenario Outline: TC-UNIVERSE-LIST-04 - Invalid page values return 400
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


  @tc-universe-list-05
  Scenario Outline: TC-UNIVERSE-LIST-05 - Invalid limit values return 400
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

  @tc-universe-list-06
  Scenario: TC-UNIVERSE-LIST-06 - Out-of-range page (no items)
    When I request the list of universes with page 999 and limit 10
    Then the universe list endpoint should respond with status code 200
    And the universe list response should return an empty universes array for page 999 and limit 10

  @tc-universe-list-07
  Scenario: TC-UNIVERSE-LIST-07 - Unknown query parameters - Ignored by backend
    When I request the list of universes with unknown query parameters
    Then the universe list endpoint should respond with status code 200
    And the universe list response should ignore unknown query parameters

  @tc-universe-list-08 @contract
  Scenario: TC-UNIVERSE-LIST-08 - Universe list returns valid UniverseDTO structure
    When I request the list of universes without pagination parameters
    Then the universe list endpoint should respond with status code 200


  @tc-universe-list-09-11
  Scenario Outline: TC-UNIVERSE-LIST-09 to 11 - Search by field value
    When I request the list of universes with pagination parameters and search "<search>"
    Then the universe list response should respect pagination page 1 and limit 10
    And all returned universes should contain "<search>" in "<field>"

    Examples:
      | search                                                             | field   |
      | Corporate Biohazard                                                | name    |
      | Un multiverso fracturado en el que cada reino protege una reliquia | premise |
      | Predomina el horror biológico                                      | notes   |

  @tc-universe-list-12
  Scenario: TC-UNIVERSE-LIST-12 - Search by rules field (array)
    When I request the list of universes with pagination parameters and search "Ningún viajero puede alterar su línea de origen"
    Then the universe list response should respect pagination page 1 and limit 10
    And all returned universes should contain "Ningún viajero puede alterar su línea de origen" in rules

  @tc-universe-list-13-15
  Scenario Outline: TC-UNIVERSE-LIST-13 to 15 - Filter by status value
    When I request the list of universes with pagination parameters and status "<status>"
    Then the universe list response should respect pagination page 1 and limit 10
    And all returned universes should contain "<status>" in "status"

    Examples:
      | status   |
      | DRAFT    |
      | ACTIVE   |
      | ARCHIVED |

  @tc-universe-list-16
  Scenario: TC-UNIVERSE-LIST-16 - Search + status combined
    When I request the list of universes with page 1, limit 10, search "Biohazard" and status "ACTIVE"
    Then the universe list response should respect pagination page 1 and limit 10
    And all returned universes should contain "Biohazard" in "name"
    And all returned universes should contain "ACTIVE" in "status"

  @tc-universe-list-17
  Scenario: TC-UNIVERSE-LIST-17 - Search with normalized spaces
    When I request the list of universes with pagination parameters and search "  Biohazard   Collapse  "
    Then the universe list response should respect pagination page 1 and limit 10
    And all returned universes should contain "Biohazard Collapse" in "name"

  @tc-universe-list-18
  Scenario: TC-UNIVERSE-LIST-18 - Blank search equals no search
    When I request the list of universes with pagination parameters and search "   "
    Then the universe list response should respect pagination page 1 and limit 10

  @tc-universe-list-19
  Scenario: TC-UNIVERSE-LIST-19 - Search exceeds 120 chars
    When I request the list of universes with pagination parameters and search longer than 120 characters
    Then the universe list endpoint should respond with status code 400
    And the universe list response error message should be "Search must be at most 120 characters"

  @tc-universe-list-20
  Scenario Outline: TC-UNIVERSE-LIST-20 - Invalid status values return 400
    When I request the list of universes with pagination parameters and status "<status>"
    Then the universe list endpoint should respond with status code 400
    And the universe list response error message should be "Status must be DRAFT, ACTIVE or ARCHIVED"

    Examples:
      | status         |
      | IN_DEVELOPMENT |
      | active         |
      | ALL            |
      | true           |
      | false          |
      | 123            |
      | null           |
      |                |