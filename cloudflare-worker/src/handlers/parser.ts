class HtmlElement {
	tagName: string;
	attributes?: Record<string, string>;
	content?: string;
	classList: string[] = [];
	id?: string;
	children?: HtmlElement[];


	constructor(tagName: string, attributes?: Record<string, string>, content?: string, classList: string[] = [], id?: string, children?: HtmlElement[]) {
		this.tagName = tagName;
		this.attributes = attributes;
		this.content = content;
		this.classList = classList;
		this.id = id;
		this.children = children;
	}

	public text(): string {
		if (this.tagName === 'text') {
			return this.content || '';
		}
		if (this.children && this.children.length > 0) {
			return this.children.map(child => child.text()).join('');
		}
		return this.content || '';
	}


	public getAttribute(name: string): string | undefined {
		return this.attributes ? this.attributes[name] || undefined : undefined;
	}
	
	public getElementById(id: string): HtmlElement|undefined {
		const findElementById = (elements: Array<HtmlElement>): HtmlElement|undefined => {
			for (const element of elements) {
				if (element.id === id) {
					return element
				}
				if (element.children) {
					const found = findElementById(element.children);
					if (found) {
						return found;
					}
				}
			}
			return undefined
		};
		if (this.id === id) {
			return this;
		}
		if (this.children && this.children.length > 0) {
			return findElementById(this.children);
		}
	}
	public getElementsByClassName(className: string): Array<HtmlElement> {
		const findElementsByClassName = (elements: Array<HtmlElement>): Array<HtmlElement> => {
			let found: Array<HtmlElement> = [];
			for (const element of elements) {
				if (element.classList && element.classList.includes(className)) {
					found.push(element);
				}
				if (element.children) {
					found = found.concat(findElementsByClassName(element.children));
				}
			}
			return found;
		};
		if (this.classList && this.classList.includes(className)) {
			return [this, ...findElementsByClassName(this.children || [])];
		}
		return findElementsByClassName(this.children || []);
	}
	public getElementsByTagName(tagName: string): Array<HtmlElement> {
		const findElementsByTagName = (elements: Array<HtmlElement>): Array<HtmlElement> => {
			let found: Array<HtmlElement> = [];
			for (const element of elements) {
				if (element.tagName === tagName) {
					found.push(element);
				}
				if (element.children) {
					found = found.concat(findElementsByTagName(element.children));
				}
			}
			return found;
		};
		if (this.tagName === tagName) {
			return [this, ...findElementsByTagName(this.children || [])];
		}
		return findElementsByTagName(this.children || []);
	}
	

	public getElementsByAttribute(attribute: string, value?: string): Array<HtmlElement> {
		const findElementsByAttribute = (elements: Array<HtmlElement>): Array<HtmlElement> => {
			let found: Array<HtmlElement> = [];
			for (const element of elements) {
				if (element.attributes && element.attributes[attribute] !== undefined) {
					if (value === undefined || element.attributes[attribute] === value) {
						found.push(element);
					}
				}
				if (element.children) {
					found = found.concat(findElementsByAttribute(element.children));
				}
			}
			return found;
		};
		if (this.attributes && this.attributes[attribute] !== undefined) {
			if (value === undefined || this.attributes[attribute] === value) {
				return [this, ...findElementsByAttribute(this.children || [])];
			}
		}
		if (this.children && this.children.length > 0) {
			return findElementsByAttribute(this.children);
		}
		return []
	}

	
}

class HtmlParser {
	elements: Array<HtmlElement> = [];
	
	constructor(html: string | HtmlElement){
		if (!html) return;
		if (typeof html !== "string") {
			// If the input is already an HtmlElement, we can directly assign it
			this.elements = [html];
			return;
		}
		const cleanHtml = html.replace(/^\s*<!doctype\s+html\s*>/i, '');
		this.elements = this.extractBodyContent(cleanHtml);
	}

	private extractBodyContent(html: string): Array<HtmlElement> {
		const bodyRegex = /<body[^>]*>([\s\S]*)<\/body>/i;
		const match = html.match(bodyRegex);

		if (match && match[1]) {
			return this.parse(match[1]);
		}
		// If no body tag found, parse the entire HTML
		return this.parse(html);
	}

	private parseAttributes(attributeString: string): Record<string, string> {
		const attributes: Record<string, string> = {};
		const regex = /([\w-]+)(?:="([^"]*)")?/g; // Updated to handle dashes in attribute names
		let match;

		while ((match = regex.exec(attributeString)) !== null) {
			const [, name, value] = match;
			attributes[name] = value || '';
		}

		return attributes;
	}

	private parse(html: string): Array <HtmlElement> {
		const elements: Array <HtmlElement> = [];
		let currentIndex = 0;

		while (currentIndex < html.length) {
			// Find the next tag
			const tagStart = html.indexOf('<', currentIndex);
			// console.log("tagStart:", tagStart);
			// If no more tags, add remaining text and break
			if (tagStart === -1) {
				const remainingText = html.slice(currentIndex).trim();
				//console.log("remainingText:", remainingText);
				if (remainingText) {
					elements.push(
						new HtmlElement('text', undefined, remainingText));
				}
				break;
			}

			// Handle text before the tag
			if (tagStart > currentIndex) {
				const text = html.slice(currentIndex, tagStart).trim();
				//console.log("Before text:", text);
				if (text) {
					elements.push(
						new HtmlElement('text', undefined, text));
				}
			}

			// Check if it's a closing tag
			if (html[tagStart + 1] === '/') {
				currentIndex = html.indexOf('>', tagStart) + 1;
				//console.log("Closing tag found, skipping to:", currentIndex);
				continue;
			}

			// Find the tag name and attributes
			// Update regex to handle self-closing tags
			const tagMatch = html.slice(tagStart).match(/^<([\w-]+)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*\/?>/);
			if (!tagMatch) {
				currentIndex = tagStart + 1;
				continue;
			}

			const [fullTag, tagName, attributeString] = tagMatch;
			const attributes = attributeString ? this.parseAttributes(attributeString.trim()) : undefined;
			const classList = attributes?.class ? attributes.class.trim().split(/\s+/) : undefined;
			const id = attributes?.id;

			// Check if it's a self-closing tag
			if (fullTag.endsWith('/>')) {
				elements.push(
					new HtmlElement(
						tagName,
						attributes,
						undefined,
						classList,
						id
					)
				);
				currentIndex = tagStart + fullTag.length;
				continue;
			}

			// Find the matching closing tag

			const startPos = tagStart + fullTag.length;
			let endPos = startPos;
			let depth = 1;

			while (depth > 0 && endPos < html.length) {
				const nextOpen = html.indexOf(`<${tagName}`, endPos);
				const nextClose = html.indexOf(`</${tagName}>`, endPos);

				if (nextClose === -1) break;
				if (nextOpen === -1 || nextOpen > nextClose) {
					depth--;
					endPos = nextClose + tagName.length + 3;
				} else {
					depth++;
					endPos = nextOpen + 1;
				}
			}

			// Extract and parse content
			const content = html.slice(startPos, endPos - tagName.length - 3);
			const children = content.trim() ? this.parse(content) : [];

			elements.push(new HtmlElement(
				tagName,
				attributes,
				//content.trim() || undefined,
				undefined,
				classList,
				id,
				children.length > 0 ? children : undefined
			));
			

			currentIndex = endPos;
		}

		return elements;
	}
	getElementById(id: string): HtmlElement | undefined {
		const findElementById = (elements: Array<HtmlElement>): HtmlElement | undefined => {
			for (const element of elements) {
				const found = element.getElementById(id);
				if (found) {
					return found;
				}
			}
			return undefined;
		}
		return findElementById(this.elements);
	}
	getElementsByClassName(className: string): Array<HtmlElement> {
		const findElementsByClassName = (elements: Array<HtmlElement>): Array<HtmlElement> => {
			let found: Array<HtmlElement> = [];
			for (const element of elements) {
				found = found.concat(element.getElementsByClassName(className));
			}
			return found;
		};
		return findElementsByClassName(this.elements);
	}
	getElementsByTagName(tagName: string): Array<HtmlElement> {
		const findElementsByTagName = (elements: Array<HtmlElement>): Array<HtmlElement> => {
			let found: Array<HtmlElement> = [];
			for (const element of elements) {
				found = found.concat(element.getElementsByTagName(tagName));
			}
			return found;
		};
		return findElementsByTagName(this.elements);
	}
	getElementsByAttribute(attribute: string, value?: string): Array<HtmlElement> {
		const findElementsByAttribute = (elements: Array<HtmlElement>): Array<HtmlElement> => {
			let found: Array<HtmlElement> = [];
			for (const element of elements) {
				found = found.concat(element.getElementsByAttribute(attribute, value));
			}
			return found;
		};
		return findElementsByAttribute(this.elements);
	}

}
export {
	HtmlParser
};