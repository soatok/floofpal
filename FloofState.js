const fs = require('fs');

module.exports = class FloofState {
    constructor(obj) {
        let config = {};
        if (typeof(obj['twitch']) === 'undefined') {
            config['twitch'] = '';
        } else {
            config['twitch'] = obj['twitch'];
        }

        if (typeof(obj.sourceImage) === 'undefined') {
            config['sourceImage'] = '';
        } else {
            config['sourceImage'] = obj['sourceImage'];
        }

        if (typeof(obj.sourceText) === 'undefined') {
            config['sourceText'] = '';
        } else {
            config['sourceText'] = obj['sourceText'];
        }

        if (typeof(obj.restImage) === 'undefined') {
            config['restImage'] = '';
        } else {
            config['restImage'] = obj['restImage'];
        }

        if (typeof(obj.activeImage) === 'undefined') {
            config['activeImage'] = '';
        } else {
            config['activeImage'] = obj['activeImage'];
        }

        if (typeof(obj.timeActive) === 'undefined') {
            config['timeActive'] = 3000;
        } else {
            config['timeActive'] = obj['timeActive'];
        }

        if (typeof(obj.speechTemplate) === 'undefined') {
            config['speechTemplate'] = "Hi ${username}!";
        } else {
            config['speechTemplate'] = obj['speechTemplate'];
        }
        this.config = config;
    }

    set(key, value) {
        this.config[key] = value;
        return this;
    }

    /**
     * @param {String} key
     * @returns {String|Number|null}
     */
    get(key) {
        if (typeof this.config[key] === "undefined") {
            return null;
        }
        return this.config[key];
    }

    /**
     * @return {boolean}
     */
    isValid() {
        if (this.config['twitch'].length < 1) {
            return false;
        }
        if (this.config['sourceImage'].length < 1) {
            return false;
        }
        if (this.config['sourceText'].length < 1) {
            return false;
        }
        if (this.config['restImage'].length < 1) {
            return false;
        }
        if (this.config['activeImage'].length < 1) {
            return false;
        }
        if (this.config['timeActive'] < 1) {
            return false;
        }
        if (this.config['speechTemplate'].length < 1) {
            return false;
        }
        return true;
    }

    /**
     * @param {String} path
     */
    save(path) {
        fs.writeFile(
            path,
            JSON.stringify(this.config),
            () => {}
        );
    }

    /**
     *
     * @returns {module.FloofState}
     */
    static default() {
        return new FloofState({
            "twitch": "",
            "sourceImage": "",
            "sourceText": "",
            "restImage": "",
            "activeImage": "",
            "timeActive": 2500,
            "speechTemplate": "Hi ${username}!"
        });
    }

    /**
     * @param {String} path
     * @return {module.FloofState}
     */
    static load(path) {
        try {
            let settings = JSON.parse(fs.readFileSync(path).toString());
            return new FloofState(settings);
        } catch (e) {
            return FloofState.default();
        }
    }
};