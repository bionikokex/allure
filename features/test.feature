# language: ru
Функциональность: The test doesn't have an implementation

    # todo тест без реализованных шагов, отображается в отчете как успешный
  @bug_example
  Сценарий: The test doesn't have an implementation
    Когда я захожу на страницу "https://playwright.dev/"
    Тогда должна быть ошибка, так как шага Then нет.
