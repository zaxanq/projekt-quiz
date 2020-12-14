class Quiz {
  states = {
    none: 'none',
    preStart: 'pre-start',
    inProgress: 'in-progress',
    finished: 'finished'
  };
  state = this.states.none;
  questions = [];
  quizElement;
  quizQuestionsElement;
  quizInstructionsElement;

  init() {
    this.createQuiz();
  }

  createQuiz() {
    this.quizElement = this.createElement('main', document.body, ['quiz']);
    this.renderQuizHeader();
    this.quizQuestionsElement = this.createElement('div', this.quizElement, ['quiz__questions']);

    this.renderQuizInstructions();
    this.state = this.states.preStart;
  }

  renderQuizInstructions() {
    const instructions = `Celem quizu jest sprawdzenie Twojej wiedzy z zakresu języków HTML, CSS i Javascript.\n\nQuiz składa się z <em>25 pytań</em> - po 8 z każdej kategorii i jedno dodatkowe, z losowej kategorii.\n\nPytania podzielone są na <em>cztery stopnie trudności</em> - po 2 z każdego. Ostatnie - dwudzieste piąte - pytanie będzie zawsze o stopniu trudności 3.\n\nKażde pytanie oznaczone jest kategorią z lewej strony.\n\nPytania są losowane z większej puli, a więc dwa podejścia do quizu będą skutkowały innymi pytaniami oraz w innej kolejności. Odpowiedzi również mogą być w innej kolejności.\n\nNie ma limitu czasowego.\n\nPowodzenia!`;

    this.quizInstructionsElement = this.createElement('section', this.quizQuestionsElement, ['quiz__instructions']);
    this.createElement('h3', this.quizInstructionsElement, ['quiz__instructions-title'], 'Przed rozpoczęciem');
    this.createElement('p', this.quizInstructionsElement, ['quiz__instructions-content'], instructions, true);

    const startButton = this.createElement('button', this.quizInstructionsElement, ['quiz__start-button', 'button'], 'Rozpocznij');
    startButton.type = 'button';
    startButton.disabled = true; //TODO: Enable after loading questions works
    startButton.addEventListener('click', this.startQuiz.bind(this));
  }

  renderQuizHeader() {
    const quizHeader = this.createElement('header', this.quizElement, ['quiz__header', 'header']);
    const titleContainer = this.createElement('hgroup', quizHeader, ['header__title-container']);
    this.createElement('h1', titleContainer, ['header__title'], 'Quiz');
    this.createElement('h2', titleContainer, ['header__subtitle'], 'HTML, CSS i JS');
  }

  startQuiz() {
    this.hide(this.quizInstructionsElement);
    this.loadQuestions();
  }

  loadQuestions() {
    const categories = ['html', 'css', 'javascript'];
    const selectedCategories = {
      html: 0,
      css: 0,
      javascript: 0,
    };

    const selectQuestion = (questions, category) => {
      let selectedQuestion = Math.floor(Math.random() * questions[category].length);

      if (questions[category][selectedQuestion]) {
        this.questions.push({
          ...questions[category][selectedQuestion],
          type: category,
        });
        return selectedQuestion;
      }
      return selectQuestion(questions, category);
    };

    const selectCategory = () => {
      const pickFrom = Math.floor(Math.random() * 3);
      const selectedCategory = categories[pickFrom];
      if (selectedCategories[selectedCategory] < 2) {
        selectedCategories[selectedCategory]++;
        return selectedCategory;
      }
      return selectCategory();
    };

    fetch('http://localhost:8000/questions.json')
      .then(res => res.json())
      .then(data => {
        let fetchedQuestions = { ...data };

        for (let i = 1; i <= 6; i++) {
          const selectedCategory = selectCategory();
          const selectedQuestion = selectQuestion(fetchedQuestions, selectedCategory);

          fetchedQuestions = {
            ...fetchedQuestions,
            [selectedCategory]: {
              ...fetchedQuestions[selectedCategory],
              [selectedQuestion]: null
            },
          };
        }

        selectQuestion(fetchedQuestions, selectCategory());
        this.renderQuestions();
      });
  }

  renderQuestions() {
    let i = 1;
    this.questions.forEach(question => {
      this.renderQuestion(i, question.type, this.parseText(question.question), question.answers);
      i++;
    });
  }

  // helper methods
  hide(element) {
    element.classList.add('display:none');
  }
  
  parseText(string) {
    return string
      .replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('[[[', '<code class="block">').replaceAll(']]]', '</code>')
      .replaceAll('[[', '<code>').replaceAll(']]', '</code>');
  }

  createElement(tag, parent, classList, content = null, contentAsHtml = false) {
    const element = document.createElement(tag);
    if (content) {
      if (contentAsHtml) element.innerHTML = content;
      else element.textContent = content;
    }
    if (classList.length) element.classList.add(...classList);
    parent.append(element);
    return element;
  }

  renderQuestion(id, type, content, answers) {
    const answerLetters = ['a', 'b', 'c', 'd'];
    const quizQuestion = this.createElement('section', this.quizQuestionsElement, ['quiz__question', 'quiz-question', `--${type}`]);
    quizQuestion.id = `question-${id}`;

    const question = this.createElement('h3', quizQuestion, ['quiz-question__question']);
    this.createElement('span', question, ['quiz-question__label'], `Pytanie ${id}: `);
    this.createElement('span', question, [], content, true);

    const answersContainer = this.createElement('div', quizQuestion, ['quiz-question__answers-container']);

    for (let i = 1; i <= 4; i++) {
      this.renderAnswer(i, answersContainer, id, answerLetters[i-1], this.parseText(answers[i-1]));
    }
  }

  renderAnswer(id, container, questionId, value, content) {
    const label = this.createElement('label', container, ['quiz-question__answer']);
    label.htmlFor = `answer-${id}`;

    const input = this.createElement('input', label, ['quiz-question__answer-input']);
    input.type = 'radio';
    input.value = value;
    input.name = `question-${questionId}`;
    input.id = `answer-${id}`;

    label.innerHTML += content;
  }
}

const test = {
  "HTML": [
    {
      "question": "Czym różni się [[<span>]] od [[<p>]]?",
      "difficulty": 2,
      "answers": [
        "[[<span>]] to generyczny element [[inline]] bez wartości semantycznej, podczas gdy [[<p>]] to paragraf.",
        "[[<span>]] to generyczny element [[block]], podczas gdy [[<p>]] to generyczny element [[inline-block]]",
        "[[<p>]] i [[<span>]] służą do tego samego, różnią się jedynie stylami.",
        "[[<p>]] to element grupujący elementy [[<span>]]."
      ],
      "explanation": "[[<span>]] to generyczny element [[inline]] którym zawsze powinniśmy oplatać tekst (chyba, że ten jest już zawarty w innym elemencie)."
    },
    {
      "question": "Jaki cel ma ten kod?[[[<meta name=\"viewport\" content=\"width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0\">]]]",
      "difficulty": 4,
      "answers": [
        "Jest to znacznik, który ustawia domyślne wyświetlenie strony na urządzeniu mobilnym.",
        "Jest to znacznik, który informuje urządzenie mobilne, że ta strona wspiera technologię renderowania \"viewport\".",
        "Ma on na celu ustawienie domyślnego wyświetlania strony na urządzeniach typu desktop.",
        "Ma on na celu ustawienie ciemnego motywu na stronie."
      ],
      "explanation": ""
    },
    {
      "question": "Które elementy będą miały czerwone tło?:[[[.list .item {\n  background-color: red;\n}]]]\n[[[<div class=\"list\">\n  <div class=\"item\">item 1</div>\n  <div class=\"item\">item 2</div>\n  <div class=\"item\">\n    <div class=\"item\">item 3</div>\n    <div class=\"item\">item 4</div>\n    <div class=\"item\">\n      <div class=\"item\">item 5</div>\n      <div class=\"item\">item 6</div>\n    </div>\n  </div>\n</div>]]]",
      "difficulty": 2,
      "answers": [
        "Wszystkie elementy [[.item]].",
        "Elementy [[.item]] \"item 1\" i \"item 2\"",
        "Elementy [[.item]] poza \"item 1\" i \"item 2\"",
        "Żaden element nie będzie miał czerwonego tła."
      ],
      "explanation": ""
    }
  ],
  "CSS": [
    {
      "question": "Jaki kolory będą miały elementy?[[[<p class=\"parent\">\n  <span id=\"item-1\" class=\"item-1\" data-name=\"item-1\">Item 1</span>\n  <span id=\"item-2\" class=\"item-2\" data-name=\"item-2\" style=\"color: greenyellow\">Item 2</span>\n  <span id=\"item-3\" class=\"item-3\" data-name=\"item-3\">Item 3</span>\n</p>]]]\n[[[.parent > * {\n  beige;\n}\n\n.item-1 {\n  color: steelblue !important;\n}\n\n.parent span {\n  color: coral;\n}\n\n.parent > .item-3 {\n  color: darkslateblue;\n}\n\n.parent #item-3 {\n  color: hotpink;\n}\n\n.parent .item-1,\n.parent .item-2 {\n  color: chocolate;\n}]]]",
      "difficulty": 3,
      "answers": [
        "Kolejno: [[steelblue]], [[limegreen]] i [[hotpink]].",
        "Kolejno: [[chocolate]], [[limegreen]] i [[darkslateblue]].",
        "Kolejno: [[chocolate]], [[chocolate]] i [[darkslateblue]].",
        "Kolejno: [[steelblue]], [[chocolate]] i [[hotpink]]."
      ],
      "explanation": "Pierwszy [[<span>]] będzie o kolorze [[steelblue]] ponieważ reguła [[!important]] jest ponad wszystkimi innymi regułami. Następny element będzie w kolorze [[limegreen]] ponieważ [[specificity]] styli [[inline]] jest najwyższym możliwym. Ostatni element będzie w kolorze [[hotpink]] ponieważ selektor id ma większe specificity niż jakiekolwiek kombinacje selektorów klas."
    },
  ]
};

(() => {
  new Quiz().init();
})();
