Feature: Allure trace

  @attach
  Scenario: Allure playwright trace in After hook
    When I open the page "https://playwright.dev/"
    Then fail intentionally
