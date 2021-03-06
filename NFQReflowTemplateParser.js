/**
 * Reflow Template Parser.
 */
export default class NFQReflowTemplateParser {
    /**
     * Reflow Template Parser Constructor.
     *
     * @param {Object} props    All properties.
     * @param {Object} children All child definitions.
     * @param {String} template Template string to parse.
     */
    constructor(props, children, template) {
        this.props = props;
        this.children = children;
        this.template = template;
        this.foundChildren = [];

        this.nodes = {
            functions: [],
            params: [],
            empty: []
        };
    }

    /**
     * Parses an Component Template.
     *
     * @return {String} Rendered Template.
     */
    parse() {
        let regex = /\$\{(.*?)\}/g;
        let matches, match, functions, param, empty;

        while ((matches = regex.exec(this.template)) !== null) {
            match = matches[1];

            if (this.props.hasOwnProperty(match)) {
                if (typeof this.props[match] === 'function') {
                    this.nodes.functions.push(match);
                } else {
                    this.nodes.params.push(match);
                }
            } else if (this.children.hasOwnProperty(match)) {
                continue;
            } else {
                this.nodes.empty.push(match);
            }
        }

        for (functions of this.nodes.functions) {
            this.parseFunctions(functions);
        }

        for (param of this.nodes.params) {
            this.parseParams(param);
        }

        for (empty of this.nodes.empty) {
            this.parseEmpty(empty);
        }

        return this.template;
    }

    /**
     * Parses an Component Template for Childs.
     *
     * @return {mixed} Rendered Template childs.
     */
    getUsedChilds() {
        let regex = /\$\{(.*?)\}/g;
        let matches, match;

        while ((matches = regex.exec(this.template)) !== null) {
            match = matches[1];

            if (this.children.hasOwnProperty(match)) {
                this.foundChildren.push(match);
            }
        }

        return this.foundChildren;
    }

    /**
    * Parses empty Nodes.
    *
    * @param {String} param Param match.
    */
    parseEmpty(param) {
        const regex = new RegExp(`\\$\\{${this.escapeRegex(param)}\\}`, 'g');

        this.template = this.template.replace(regex, '');
    }

    /**
    * Parses params.
    *
    * @param {String} param Param match.
    */
    parseParams(param) {
        const regex = new RegExp(`\\$\\{${this.escapeRegex(param)}\\}`, 'g');

        this.template = this.template.replace(regex, this.props[param]);
    }

    /**
    * Parses Template functions.
    *
    * @param {String} param Param match.
    */
    parseFunctions(param) {
        let ret = this.props[param]();
        const regex = new RegExp(`\\$\\{${this.escapeRegex(param)}\\}`, 'g');

        if (typeof ret === 'undefined') {
            ret = '';
        }

        this.template = this.template.replace(regex, ret);
    }

    /**
    * Escapes an regex.
    *
    * @param {string} s String to escape.
    *
    * @return {string} Escaped regex.
    */
    escapeRegex(s) {
        /* eslint-disable no-useless-escape */
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        /* eslint-enable no-useless-escape */
    }
}