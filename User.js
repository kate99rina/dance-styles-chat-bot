export class User {
    constructor(id, name) {
        this.#id = id;
        this.#name = name;
    }
    #id;
    #name;
    #currentState = 1;
    #answers = new Map();
    
    addAnswer(state, answer) {
        this.#answers.set(state, answer);
    }
    set state(value){
        this.#currentState = value;
    }
    get state(){
        return this.#currentState;
    }
}