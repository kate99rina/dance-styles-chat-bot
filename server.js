// const User = require('./User.js');

// import { User } from './User.js';
//create proxy for enum 
function Enum(baseEnum) {
    return new Proxy(baseEnum, {
        get(target, name) {
            if (!baseEnum.hasOwnProperty(name)) {
                throw new Error(`"${name}" value does not exist in the enum`)
            }
            return baseEnum[name]
        },
        set(target, name, value) {
            throw new Error('Cannot add a new value to the enum')
        }
    })
}

//   import { Enum } from './enum'

const Styles = Enum({
    HipHop: 'HipHop',
    JazzFunk: 'JazzFunk',
    DH: 'Dancehall',
    FemDH: 'Female Dancehall',
    AfroHouse: 'AfroHouse',
    House: 'House',
    Amapiano: 'Amapiano',
    Contemp: 'Contemporary',
    Strip: 'Strip/FrameUp',
    Popping: 'Popping',
    Waving: 'Waving',
    Shaffle: 'Shaffle',
    HighHeels: 'HighHeels',
    Twerk: 'Twerk',
    Kpop: 'K-pop',
    Vogue: 'Vogue',
    Waacking: 'Waacking',
    Reggeton: 'Reggeton'
})



class User {
    constructor(id, name) {
        this.#_id = id;
        this.#_name = name;
    }
    #_id;
    #_name;
    #_currentState = 1;
    #_results = new Map();
    #_answers = new Map();

    addAnswer(state, answer) {
        this.#_answers.set(state, answer);
    }
    updateState() {
        this.#_currentState ++;
    }
    get state() {
        return this.#_currentState;
    }
    get result() {
        return this.#_results;
    }
    updateResults(...styles) {
        styles.forEach((style) => {
            if (!this.#_results.has(style)) {
                this.#_results.set(style, 1);
                console.log('Добавлен новый стиль - ' + style)
            } else {
                let value = this.#_results.get(style)
                console.log(typeof this.#_results.get(style))
                console.log(typeof value)
                this.#_results.set(style, ++value)
                console.log('Увеличен счетчик. Стиль - ' + style + ', счетчик: ' + this.#_results.get(style))

            }
        });

    }
    setDefaultState() {
        this.#_currentState = 1
        this.#_results = new Map();
        this.#_answers = new Map();
    }
    get top3() {

        // Преобразуем Map в массив пар [ключ, значение]
        let mapArray = Array.from(this.#_results);

        // Отсортируем массив пар по значению
        mapArray.sort((a, b) => b[1] - a[1]);

        // Преобразуем отсортированный массив пар обратно в Map
        const sortedMap = new Map(mapArray);

        // Проверим результат
        console.log(sortedMap);
        let top = '';

        let count = 0;
        for (let style of sortedMap.keys()) {
            if (count < 3) {
                top = top.concat(style).concat(' ')
            }
            count++
        }
        console.log(top);
        return top;

    }
}

const TelegramBot = require('node-telegram-bot-api');
const API_KEY_BOT = '7282972390:AAFzk1scb_OZngxZckVDkiuR6ZYd9xVkIXc';

const users = new Map();



const commands = [

    {

        command: "start",
        description: "Запуск бота"

    },
    {

        command: "help",
        description: "Раздел помощи"

    }

]



const bot = new TelegramBot(API_KEY_BOT, {

    polling: {
        interval: 300,
        autoStart: true
    }


});
bot.on("polling_error", err => console.log(err.data.error.message));

bot.setMyCommands(commands);

bot.on('text', async msg => {

    console.log(msg.text);


    try {
        currentChatId = msg.chat.id;
        currentChatState = 0;

        if (msg.text == '/start') {

            await bot.sendMessage(msg.chat.id, `Привет, как тебя зовут?)`);

        }
        else if (new RegExp('^[А-ЯЁа-яё]*$').test(msg.text.trim())) {

            await bot.sendMessage(currentChatId, 'Рада знакомству, ' + msg.text);
            var newUser = new User(currentChatId, msg.text.trim());

            await bot.sendMessage(currentChatId, 'Я буду твоим помощником в выборе стиля танцев)');
            await bot.sendMessage(currentChatId, 'Но для этого мне нужно узнать о тебе получше. Поехали?)', {
                reply_markup: {

                    keyboard: [
                        ['⭐️ Дааа']
                    ]

                }
            });

            users.set(currentChatId, newUser);

        } else {
            currentUser = users.get(currentChatId);
            currentChatState = currentUser.state;


            if (currentChatState == 1) {

                currentUser.addAnswer(1, msg.text);
                currentUser.updateState();
                await bot.sendMessage(currentChatId, 'Почему ты хочешь пойти на танцы?', {

                    reply_markup: {

                        keyboard: [

                            ['⭐️ Хочу научиться двигаться, чтобы уверенно танцевать в клубах'],
                            ['⭐️ Эмоциональная разгрузка после работы', '⭐️ Выражать эмоции, которые не привычны в жизни'],
                            ['⭐️ Люблю спорт', '⭐️ Нравится смотреть на подтанцовку артистов в клипах'],
                            ['⭐️ Это просто мое новое увлечение']

                        ]

                    }

                });
            } else if (currentChatState == 2) {
                currentUser.addAnswer(2, msg.text);
                currentUser.updateState();
                switch (msg.text) {
                    case '⭐️ Хочу научиться двигаться, чтобы уверенно танцевать в клубах':
                        currentUser.updateResults(Styles.HighHeels, Styles.JazzFunk, Styles.FemDH, Styles.HipHop)
                        break
                    case '⭐️ Эмоциональная разгрузка после работы':
                        currentUser.updateResults(Styles.Popping, Styles.Waving, Styles.Vogue)
                        break
                    case '⭐️ Выражать эмоции, которые не привычны в жизни':
                        currentUser.updateResults(Styles.FemDH, Styles.HighHeels, Styles.Twerk, Styles.AfroHouse, Styles.Amapiano, Styles.Reggeton)
                        break
                    case '⭐️ Люблю спорт':
                        currentUser.updateResults(Styles.Contemp, Styles.AfroHouse, Styles.House, Styles.Shaffle, Styles.Popping, Styles.HipHop)
                        break
                    case '⭐️ Нравится смотреть на подтанцовку артистов в клипах':
                        currentUser.updateResults(Styles.Kpop, Styles.HighHeels, Styles.JazzFunk, Styles.HipHop)
                        break
                    default:
                        break
                }

                await bot.sendMessage(currentChatId, 'Под какую музыку ты любишь танцевать, когда никто не видит, в большинстве случаев?)', {
                    reply_markup: {
                        keyboard: [
                            ['⭐️ Секси вайб', '⭐️ Мелодичную'],
                            ['⭐️ Энергичную, похожую на регетон или имеющую афро ритмы'],
                            ['⭐️ Качающую, rnb,  хип хоп', '⭐️ То, что играет в клубе']
                        ]
                    }
                });

            } else if (currentChatState == 3) {
                currentUser.addAnswer(3, msg.text);
                currentUser.updateState();

                switch (msg.text) {
                    case '⭐️ Секси вайб':
                        currentUser.updateResults(Styles.HighHeels, Styles.JazzFunk, Styles.FemDH, Styles.Twerk, Styles.Strip, Styles.Reggeton)
                        break
                    case '⭐️ Мелодичную':
                        currentUser.updateResults(Styles.Waving, Styles.Contemp)
                        break
                    case '⭐️ Энергичную, похожую на регетон или имеющую афро ритмы':
                        currentUser.updateResults(Styles.FemDH, Styles.HighHeels, Styles.Twerk, Styles.AfroHouse, Styles.Amapiano, Styles.Reggeton)
                        break
                    case '⭐️ Качающую, rnb,  хип хоп':
                        currentUser.updateResults(Styles.Contemp, Styles.AfroHouse, Styles.House, Styles.Shaffle, Styles.Popping, Styles.HipHop)
                        break
                    case '⭐️ То, что играет в клубе':
                        currentUser.updateResults(Styles.Kpop, Styles.HighHeels, Styles.JazzFunk, Styles.HipHop, Styles.Reggeton)
                        break
                    default:
                        break
                }

                await bot.sendMessage(currentChatId, 'Когда играет любимая музыка, какие части тела в первую очередь начинают двигаться в такт музыке?)', {

                    reply_markup: {
                        keyboard: [
                            ['⭐️ Бедра/таз', '⭐️ Ноги', '⭐️ Руки'],
                            ['⭐️ Просто начинаю качать', '⭐️ Ноги и грудной отдел']
                        ]
                    }

                });

            } else if (currentChatState == 4) {
                currentUser.addAnswer(4, msg.text);
                currentUser.updateState();

                switch (msg.text) {
                    case '⭐️ Бедра/таз':
                        currentUser.updateResults(Styles.Twerk, Styles.Reggeton, Styles.Amapiano, Styles.FemDH)
                        break
                    case '⭐️ Ноги':
                        currentUser.updateResults(Styles.House, Styles.Shaffle, Styles.Strip, Styles.JazzFunk, Styles.Contemp)
                        break
                    case '⭐️ Руки':
                        currentUser.updateResults(Styles.Waving, Styles.Waacking, Styles.Popping)
                        break
                    case '⭐️ Просто начинаю качать':
                        currentUser.updateResults(Styles.HipHop, Styles.DH, Styles.AfroHouse, Styles.Shaffle)
                        break
                    case '⭐️ Ноги и грудной отдел':
                        currentUser.updateResults(Styles.HighHeels, Styles.Kpop, Styles.AfroHouse)
                        break
                    default:
                        break
                }

                await bot.sendMessage(currentChatId, 'Тебе больше нравится танцевать на ногах или на полу?)Готова ли ты танцевать на полу?)', {

                    reply_markup: {

                        keyboard: [

                            ['⭐️ Люблю партер', '⭐️ Лучше на ногах']

                        ]

                    }

                });
            } else if (currentChatState == 5) {
                currentUser.addAnswer(5, msg.text);
                currentUser.updateState();

                switch (msg.text) {
                    case '⭐️ Люблю партер':
                        currentUser.updateResults(Styles.Contemp, Styles.Strip, Styles.Twerk)
                        break
                    default:
                        break
                }

                await bot.sendMessage(currentChatId, 'Что насчет обуви?)', {

                    reply_markup: {

                        keyboard: [

                            ['⭐️ Каблуки', '⭐️ Кроссы', '⭐️ Босиком или в носочках', '⭐️ Неважно']

                        ]

                    }

                });
            } else if (currentChatState == 6) {
                currentUser.addAnswer(6, msg.text);
                currentUser.updateState();

                switch (msg.text) {
                    case '⭐️ Каблуки':
                        currentUser.updateResults(Styles.HighHeels, Styles.Strip, Styles.JazzFunk)
                        break
                    case '⭐️ Босиком или в носочках':
                        currentUser.updateResults(Styles.Contemp, Styles.FemDH)
                        break
                    default:
                        break
                }

                await bot.sendMessage(currentChatId, 'Какие тебя больше всего привлекают движения?)', {

                    reply_markup: {

                        keyboard: [

                            ['⭐️ Амплитудные и объемные', '⭐️ Футворки(комбинации ногами)'],
                            ['⭐️ Мелкие, но техничные движения']

                        ]

                    }

                });
            } else if (currentChatState == 7) {
                currentUser.addAnswer(7, msg.text);
                currentUser.updateState();

                switch (msg.text) {
                    case '⭐️ Амплитудные и объемные':
                        currentUser.updateResults(Styles.HipHop, Styles.Contemp, Styles.JazzFunk, Styles.Kpop)
                        break
                    case '⭐️ Футворки(комбинации ногами)':
                        currentUser.updateResults(Styles.Shaffle, Styles.AfroHouse, Styles.House, Styles.Amapiano)
                        break
                    case '⭐️ Мелкие, но техничные движения':
                        currentUser.updateResults(Styles.Popping, Styles.Waving, Styles.Twerk, Styles.Vogue, Styles.Waacking)
                        break
                    default:
                        break
                }

                await bot.sendMessage(currentChatId, 'Любишь ли ты задротство?)', {

                    reply_markup: {

                        keyboard: [

                            ['⭐️ Да', '⭐️ Нет)']

                        ]

                    }

                });
            } else if (currentChatState == 8) {
                currentUser.addAnswer(8, msg.text);
                currentUser.updateState();

                switch (msg.text) {
                    case '⭐️ Да':
                        currentUser.updateResults(Styles.Popping, Styles.Waving, Styles.Strip)
                        break
                    default:
                        break
                }


                await bot.sendMessage(currentChatId, 'Подсчитываем результат..Готов(а)?)', {

                    reply_markup: {

                        keyboard: [

                            ['⭐️ Даааа', '⭐️ Не, го заново']

                        ]

                    }

                });
                console.log('Ответы: ');
                users.get(currentChatId).result.forEach((value, key, map) => {
                    console.log(`${key}: ${value}`);
                });
            } else if (currentChatState == 9) {
                if (msg.text == '⭐️ Не, го заново') {
                    users.get(currentChatId).setDefaultState()
                    await bot.sendMessage(currentChatId, 'Итак, еще разок?)', {

                        reply_markup: {

                            keyboard: [

                                ['Погнали!!!']

                            ]

                        }

                    })
                } else await bot.sendMessage(currentChatId, 'Итак, тебе могут понравиться такие стили, как: ' + users.get(currentChatId).top3)
            }
        }
    }
    catch (error) {

        console.log(error);

    }
});


