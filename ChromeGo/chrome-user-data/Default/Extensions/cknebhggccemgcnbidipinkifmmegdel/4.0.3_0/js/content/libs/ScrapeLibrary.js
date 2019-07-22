var ScrapeLibrary;
(function (ScrapeLibrary) {
    var Scraper = (function () {
        function Scraper(htmlDocument) {
            this.htmlDocument = htmlDocument;
            this.evaluators = {
                "Css": new CssEvaluator(),
                "Xpath": new XPathEvaluator(),
                "UrlJsRegex": new UrlJsRegexEvaluator(),
                "Metatag": new MetatagEvaluator(new CssEvaluator())
            };
        }
        Scraper.prototype.canHandle = function (requestType) {
            return requestType === "scraperScrape";
        };
        Scraper.prototype.handle = function (specification) {
            if (!specification) {
                throw new Error("specification must be specified: " + specification);
            }
            if (!specification.contentType) {
                throw new Error("specification must have a content type");
            }
            if (!specification.scraperType) {
                throw new Error("specification must have an scraper type");
            }
            if (!specification.scraper) {
                throw new Error("specification must have an scraper expression");
            }
            var evaluator = this.evaluators[specification.scraperType];
            if (!evaluator) {
                throw new Error("No evaluator installed for scraper type: " + specification.scraperType);
            }
            return evaluator.execute(this.htmlDocument, specification.scraper, specification.contentType, specification.attributeSource);
        };
        return Scraper;
    })();
    ScrapeLibrary.Scraper = Scraper;
    var CssEvaluator = (function () {
        function CssEvaluator() {
        }
        CssEvaluator.prototype.execute = function (htmlDocument, expression, contentType, attributeSource) {
            var contents = [];
            var result = htmlDocument.querySelectorAll(expression);
            if (!result) {
                return contents;
            }
            for (var i = 0; i < result.length; i++) {
                var element = result[i];
                if (!element) {
                    continue;
                }
                var contentValue = attributeSource ? element.getAttribute(attributeSource) : element.innerText;
                if (contentValue) {
                    contents.push({ contentType: contentType, contentBody: contentValue });
                }
            }
            return contents;
        };
        return CssEvaluator;
    })();
    var UrlJsRegexEvaluator = (function () {
        function UrlJsRegexEvaluator() {
        }
        UrlJsRegexEvaluator.prototype.execute = function (htmlDocument, expression, contentType) {
            var contents = [];
            var patterns = expression.split("\n");
            if (patterns.length !== 2) {
                throw new Error("UrlJsRegex expression must have exactly two lines: " + patterns);
            }
            var matchPattern = patterns[0];
            var contentPattern = patterns[1];
            var regex = new RegExp(matchPattern);
            var url = htmlDocument.URL;
            var matches = url.match(regex);
            if (!matches || !matches[0]) {
                return contents;
            }
            var contentValue = url.replace(regex, contentPattern);
            if (contentValue) {
                contents.push({ contentType: contentType, contentBody: contentValue });
            }
            return contents;
        };
        return UrlJsRegexEvaluator;
    })();
    var XPathEvaluator = (function () {
        function XPathEvaluator() {
        }
        XPathEvaluator.prototype.execute = function (htmlDocument, expression, contentType, attributeSource) {
            var contents = [];
            if (!htmlDocument.evaluate) {
                throw new Error("htmlDocument does not define evaluate()");
            }
            var result = htmlDocument.evaluate(expression, htmlDocument, null, 0 /* ANY_TYPE */, null);
            var resultType = result.resultType;
            var node;
            switch (resultType) {
                case 1 /* NUMBER_TYPE */:
                    if (typeof result.numberValue !== "undefined") {
                        contents.push({ contentType: contentType, contentBody: result.numberValue });
                    }
                    break;
                case 2 /* STRING_TYPE */:
                    if (result.stringValue) {
                        contents.push({ contentType: contentType, contentBody: result.stringValue });
                    }
                    break;
                case 3 /* BOOLEAN_TYPE */:
                    if (typeof result.booleanValue !== "undefined") {
                        contents.push({ contentType: contentType, contentBody: result.booleanValue });
                    }
                    break;
                case 4 /* UNORDERED_NODE_ITERATOR_TYPE */:
                case 5 /* ORDERED_NODE_ITERATOR_TYPE */:
                    var maxIterations = 32;
                    var iterationNumber = 0;
                    while (iterationNumber < maxIterations) {
                        iterationNumber++;
                        node = result.iterateNext();
                        if (!node) {
                            break;
                        }
                        var contentValue = attributeSource ? node.getAttribute(attributeSource) : node.innerText;
                        if (contentValue) {
                            contents.push({ contentType: contentType, contentBody: contentValue });
                        }
                    }
                    break;
                case 6 /* UNORDERED_NODE_SNAPSHOT_TYPE */:
                case 7 /* ORDERED_NODE_SNAPSHOT_TYPE */:
                    for (var i = 0; i < result.snapshotLength; i++) {
                        node = result.snapshotItem(i);
                        if (!node) {
                            continue;
                        }
                        var contentValue = attributeSource ? node.getAttribute(attributeSource) : node.innerText;
                        if (contentValue) {
                            contents.push({ contentType: contentType, contentBody: contentValue });
                        }
                    }
                    break;
                case 8 /* ANY_UNORDERED_NODE_TYPE */:
                case 9 /* FIRST_ORDERED_NODE_TYPE */:
                    node = result.singleNodeValue;
                    if (!node) {
                        break;
                    }
                    var contentValue = attributeSource ? node.getAttribute(attributeSource) : node.innerText;
                    if (contentValue) {
                        contents.push({ contentType: contentType, contentBody: contentValue });
                    }
                    break;
                default:
                    throw new Error("Unexpected resultType found: " + resultType);
            }
            return contents;
        };
        return XPathEvaluator;
    })();
    var MetatagEvaluator = (function () {
        function MetatagEvaluator(cssEvaluator) {
            this.cssEvaluator = cssEvaluator;
        }
        MetatagEvaluator.prototype.execute = function (htmlDocument, serializedScraper) {
            var scraper = JSON.parse(serializedScraper);
            var requiredProperties = scraper.requiredProperties;
            var scrapableProperties = scraper.scrapableProperties;
            var contents = [];
            if (!requiredProperties || !scrapableProperties || !scrapableProperties.length) {
                throw new Error("Metatag scraper: null or empty parameters: " + [requiredProperties, scrapableProperties]);
            }
            for (var i = 0; i < requiredProperties.length; i++) {
                var requiredPropery = requiredProperties[i];
                var content = this.cssEvaluator.execute(htmlDocument, "meta[property=\"" + requiredPropery.name + "\"]", "Keywords", "content").shift();
                if (!content || content.contentBody !== requiredPropery.value) {
                    return [];
                }
            }
            for (var i = 0; i < scrapableProperties.length; i++) {
                var scrapablePropery = scrapableProperties[i];
                var content = this.cssEvaluator.execute(htmlDocument, "meta[property=\"" + scrapablePropery.name + "\"]", scrapablePropery.contentType, "content").shift();
                if (content) {
                    contents.push(content);
                }
            }
            return contents;
        };
        return MetatagEvaluator;
    })();
    var XPathResultTypes;
    (function (XPathResultTypes) {
        XPathResultTypes[XPathResultTypes["ANY_TYPE"] = 0] = "ANY_TYPE";
        XPathResultTypes[XPathResultTypes["NUMBER_TYPE"] = 1] = "NUMBER_TYPE";
        XPathResultTypes[XPathResultTypes["STRING_TYPE"] = 2] = "STRING_TYPE";
        XPathResultTypes[XPathResultTypes["BOOLEAN_TYPE"] = 3] = "BOOLEAN_TYPE";
        XPathResultTypes[XPathResultTypes["UNORDERED_NODE_ITERATOR_TYPE"] = 4] = "UNORDERED_NODE_ITERATOR_TYPE";
        XPathResultTypes[XPathResultTypes["ORDERED_NODE_ITERATOR_TYPE"] = 5] = "ORDERED_NODE_ITERATOR_TYPE";
        XPathResultTypes[XPathResultTypes["UNORDERED_NODE_SNAPSHOT_TYPE"] = 6] = "UNORDERED_NODE_SNAPSHOT_TYPE";
        XPathResultTypes[XPathResultTypes["ORDERED_NODE_SNAPSHOT_TYPE"] = 7] = "ORDERED_NODE_SNAPSHOT_TYPE";
        XPathResultTypes[XPathResultTypes["ANY_UNORDERED_NODE_TYPE"] = 8] = "ANY_UNORDERED_NODE_TYPE";
        XPathResultTypes[XPathResultTypes["FIRST_ORDERED_NODE_TYPE"] = 9] = "FIRST_ORDERED_NODE_TYPE";
    })(XPathResultTypes || (XPathResultTypes = {}));
})(ScrapeLibrary || (ScrapeLibrary = {}));