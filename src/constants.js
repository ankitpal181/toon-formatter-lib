/**
 * TOON Converter Constants
 * 
 * Contains configuration values and optimization dictionaries.
 */

/**
 * EXPENSIVE_WORDS Dictionary
 * 
 * Maps verbose phrases to their token-efficient abbreviations.
 * Used by Smart Code Optimization to reduce token count in text.
 * 
 * These replacements are ONLY applied to non-code text to preserve
 * code syntax integrity.
 */
export const EXPENSIVE_WORDS = {
    // Contractions
    "i am": "i'm",
    "do not": "don't",
    "would not": "wouldn't",
    "i will": "i'll",
    "i have": "i've",
    "you are": "you're",
    "we will": "we'll",
    "they are": "they're",
    "it is": "it's",
    "could have": "could've",
    "should not": "shouldn't",
    "has not": "hasn't",
    "there is": "there's",

    // Abbreviations - Common Phrases
    "as soon as possible": "asap",
    "frequently asked questions": "faq",
    "user interface": "ui",
    "to be determined": "tbd",
    "by the way": "btw",
    "artificial intelligence": "ai",
    "large language model": "llm",
    "point of view": "pov",
    "for your information": "fyi",
    "estimated time of arrival": "eta",
    "end of day": "eod",

    // Informal Contractions
    "going to": "gonna",
    "want to": "wanna",
    "got to": "gotta",
    "give me": "gimme",
    "kind of": "kinda",
    "don't know": "dunno",
    "thank you": "thanks",

    // Abbreviations - Titles/Places
    "doctor": "dr.",
    "street": "st.",
    "avenue": "ave.",
    "incorporated": "inc.",

    // Abbreviations - General
    "utility": "util",
    "laboratory": "lab",
    "photograph": "photo",
    "refrigerator": "fridge",
    "vegetables": "veggies",
    "mathematics": "math",
    "gymnasium": "gym",
    "advertisement": "ad",
    "vegetarian": "veg",

    // Synonym Simplifications
    "approximate": "approx",
    "regarding": "re:",
    "information": "info",
    "amount": "amt",
    "reference": "ref",
    "management": "mgmt",
    "number": "no.",
    "because": "as",
    "without": "w/o",
    "before": "b4",
    "between": "btw",
    "example": "e.g.",
    "demonstrate": "show",
    "utilize": "use",
    "purchase": "buy",
    "sufficient": "enough",
    "assist": "help",
    "request": "ask",
    "inexpensive": "cheap",
    "tomorrow": "tmrw",
    "message": "msg",
    "people": "ppl",
    "please": "pls",
    "business": "biz",
    "favorite": "fav",
    "every": "ea.",
    "minute": "min",
    "second": "sec",
    "annually": "yearly",
    "and": "&",
    "resulting in": "leads to",
    "important": "imp.",
    "versus": "vs",
    "determine": "find",
    "terminate": "end",
    "initialize": "start",
    "commence": "begin",
    "equivalent": "same",
    "acquire": "get",
    "maximum": "max",
    "minimum": "min",
    "miscellaneous": "misc",
    "introduction": "intro",
    "definition": "def",
    "character": "char",
    "equation": "eq",
    "weight": "wt",
    "height": "ht",
    "quantity": "qty",
    "average": "avg",
    "standard": "std",
    "package": "pkg",
    "document": "doc",
    "government": "govt",

    // Days/Months
    "january": "jan",
    "february": "feb",
    "august": "aug",
    "september": "sept",
    "october": "oct",
    "november": "nov",
    "december": "dec",
    "monday": "mon",
    "tuesday": "tue",
    "wednesday": "wed",
    "thursday": "thur",
    "friday": "fri",
    "saturday": "sat",
    "sunday": "sun"
};
