import * as NavHandlerUtils from '../../lib/navigation/NavHandlerUtils';
import { MatchByTypes } from '../../lib/lib';

describe('NavHandlerUtils.parseMatches', () => {
    it('parses the correct number of matches from a non-empty format', () => {
        const matches = NavHandlerUtils.parseMatches('/a/b/c/d');
        expect(matches.length).toBe(4);
    });

    it('removes empty segments from the path', () => {
        const matches = NavHandlerUtils.parseMatches('/a/b/c//d/');
        expect(matches.length).toBe(4);
    });
});

describe('NavHandlerUtils.parseMatch', () => {
    it('properly parses an exact match', () => {
        const match = NavHandlerUtils.parseMatch('exactSegment', 0);
        expect(match.position).toBe(0);
        expect(match.parseFormat).toBeNull();
        expect(match.matchBy).toBe(MatchByTypes.Exact);
        expect(match.value).toBe('exactSegment');
    });

    it('properly parses a variable match', () => {
        const match = NavHandlerUtils.parseMatch(':matchValue', 1);
        expect(match.position).toBe(1);
        expect(match.parseFormat).toBeNull();
        expect(match.matchBy).toBe(MatchByTypes.Present);
        expect(match.value).toBe('matchValue');
    });

    it('properly parses an int variable match', () => {
        const match = NavHandlerUtils.parseMatch(':[int]intValue', 2);
        expect(match.position).toBe(2);
        expect(match.parseFormat).toBe('int');
        expect(match.matchBy).toBe(MatchByTypes.Present);
        expect(match.value).toBe('intValue');
    });

    it('properly parses an optional match', () => {
        const match = NavHandlerUtils.parseMatch('?optionalMatch', 1);
        expect(match.position).toBe(1);
        expect(match.parseFormat).toBeNull();
        expect(match.matchBy).toBe(MatchByTypes.Optional);
        expect(match.value).toBe('optionalMatch');
    });

    it('properly parses an int optional match', () => {
        const match = NavHandlerUtils.parseMatch('?[int]intOptionalMatch', 1);
        expect(match.position).toBe(1);
        expect(match.parseFormat).toBe('int');
        expect(match.matchBy).toBe(MatchByTypes.Optional);
        expect(match.value).toBe('intOptionalMatch');
    });
});

describe('NavHandlerUtils.compareMatch', () => {
    it('correctly matches an exact match', () => {
        const match = NavHandlerUtils.exactMatch(0, 'exactValue');
        const didMatch = NavHandlerUtils.compareMatch('exactValue', match);
        expect(didMatch).toBe(true);
    });

    it('correctly fails to match an exact match', () => {
        const match = NavHandlerUtils.exactMatch(0, 'exactValue');
        const didMatch = NavHandlerUtils.compareMatch('notExactValue', match);
        expect(didMatch).toBe(false);
    });

    it('correctly matches a present match', () => {
        const match = NavHandlerUtils.presentMatch(0, 'presentValue');
        const didMatch = NavHandlerUtils.compareMatch('somePresentValue', match);
        expect(didMatch).toBe(true);
    });

    it('correctly fails to match a present match', () => {
        const match = NavHandlerUtils.presentMatch(0, 'presentValue');
        const didMatch = NavHandlerUtils.compareMatch('', match);
        expect(didMatch).toBe(false);
    });

    it('correctly matches a present match with int format', () => {
        const match = NavHandlerUtils.presentMatch(0, 'presentValue', 'int');
        const didMatch = NavHandlerUtils.compareMatch('12', match);
        expect(didMatch).toBe(true);
    });

    it('correctly fails to match a non-int value with a present match with int format', () => {
        const match = NavHandlerUtils.presentMatch(0, 'presentValue', 'int');
        const didMatch = NavHandlerUtils.compareMatch('someValue', match);
        expect(didMatch).toBe(false);
    });

    it('correctly fails to match a missing value with a present match with int format', () => {
        const match = NavHandlerUtils.presentMatch(0, 'presentValue', 'int');
        const didMatch = NavHandlerUtils.compareMatch('', match);
        expect(didMatch).toBe(false);
    });

    it('correctly matches an optional match', () => {
        const match = NavHandlerUtils.optionalMatch(0, 'optionalValue');
        const didMatch = NavHandlerUtils.compareMatch('somePresentValue', match);
        expect(didMatch).toBe(true);
    });

    it('correctly fails to match an optional match', () => {
        const match = NavHandlerUtils.optionalMatch(0, 'optionalValue');
        const didMatch = NavHandlerUtils.compareMatch('', match);
        expect(didMatch).toBe(true);
    });

    it('correctly matches a present value with an optional match with int format', () => {
        const match = NavHandlerUtils.optionalMatch(0, 'optionalValue', 'int');
        const didMatch = NavHandlerUtils.compareMatch('12', match);
        expect(didMatch).toBe(true);
    });

    it('correctly fails to match a non-int value with an optional match with int format', () => {
        const match = NavHandlerUtils.optionalMatch(0, 'optionalValue', 'int');
        const didMatch = NavHandlerUtils.compareMatch('someValue', match);
        expect(didMatch).toBe(false);
    });

    it('correctly match a missing value with an optional match with int format', () => {
        const match = NavHandlerUtils.optionalMatch(0, 'optionalValue', 'int');
        const didMatch = NavHandlerUtils.compareMatch('', match);
        expect(didMatch).toBe(true);
    });
});

describe('NavHandlerUtils.checkNumericMatch', () => {
    it('fails with int format and non-parsable value', () => {
        const match = NavHandlerUtils.presentMatch(0, 'intValue', 'int');
        const passedCheck = NavHandlerUtils.checkNumericMatch('notParsable', match);
        expect(passedCheck).toBe(false);
    });

    it('fails with int format and empty value', () => {
        const match = NavHandlerUtils.presentMatch(0, 'intValue', 'int');
        const passedCheck = NavHandlerUtils.checkNumericMatch('', match);
        expect(passedCheck).toBe(false);
    });

    it('passes with int format and parsable value', () => {
        const match = NavHandlerUtils.presentMatch(0, 'intValue', 'int');
        const passedCheck = NavHandlerUtils.checkNumericMatch('12', match);
        expect(passedCheck).toBe(true);
    });

    it('passes with non-int format and parsable value', () => {
        const match = NavHandlerUtils.presentMatch(0, 'intValue');
        const passedCheck = NavHandlerUtils.checkNumericMatch('12', match);
        expect(passedCheck).toBe(true);
    });

    it('passes with non-int format and non-parsable value', () => {
        const match = NavHandlerUtils.presentMatch(0, 'intValue');
        const passedCheck = NavHandlerUtils.checkNumericMatch('notParsable', match);
        expect(passedCheck).toBe(true);
    });
});

describe('NavHandlerUtils.sortedAndFilledPattern', () => {
    it('sorts a list of match items', () => {
        const originalMatches = [
            NavHandlerUtils.presentMatch(2, 'third'),
            NavHandlerUtils.presentMatch(0, 'first'),
            NavHandlerUtils.presentMatch(1, 'second')
        ];
        const finalMatches = NavHandlerUtils.sortedAndFilledPattern(originalMatches);
        expect(finalMatches.length).toBe(3);
        expect(finalMatches[0].position).toBe(0);
        expect(finalMatches[0].value).toBe('first');
        expect(finalMatches[1].position).toBe(1);
        expect(finalMatches[1].value).toBe('second');
        expect(finalMatches[2].position).toBe(2);
        expect(finalMatches[2].value).toBe('third');
    });

    it('fills gaps in a list of match items', () => {
        const originalMatches = [
            NavHandlerUtils.presentMatch(4, 'fifth'),
            NavHandlerUtils.presentMatch(0, 'first'),
            NavHandlerUtils.presentMatch(2, 'third')
        ];
        const finalMatches = NavHandlerUtils.sortedAndFilledPattern(originalMatches);
        expect(finalMatches.length).toBe(5);
        expect(finalMatches[0].position).toBe(0);
        expect(finalMatches[0].value).toBe('first');
        expect(finalMatches[1].position).toBe(1);
        expect(finalMatches[1].value).toBe('field1');
        expect(finalMatches[1].matchBy).toBe(MatchByTypes.Present);
        expect(finalMatches[2].position).toBe(2);
        expect(finalMatches[2].value).toBe('third');
        expect(finalMatches[3].position).toBe(3);
        expect(finalMatches[3].matchBy).toBe(MatchByTypes.Present);
        expect(finalMatches[3].value).toBe('field3');
        expect(finalMatches[4].position).toBe(4);
        expect(finalMatches[4].value).toBe('fifth');
    });
});

describe('NavHandlerUtils.parsedPath', () => {
    it('parses the value based on int format', () => {
        const match = NavHandlerUtils.presentMatch(0, 'intMatch', 'int');
        const value = NavHandlerUtils.parsedPath('12', match);
        expect(value).toBe(12);
    });

    it('retains the value based on no format', () => {
        const match = NavHandlerUtils.presentMatch(0, 'match');
        const value = NavHandlerUtils.parsedPath('12', match);
        expect(value).toBe('12');
    });

    it('retains the value based on unknown format', () => {
        const match = NavHandlerUtils.presentMatch(0, 'unknownMatch', 'unknown');
        const value = NavHandlerUtils.parsedPath('12', match);
        expect(value).toBe('12');
    });
});

describe('NavHandlerUtils.buildNavigationTarget', () => {
    it('', () => {
        const nav = NavHandlerUtils.buildNavigationTarget('/app/path1//path2/   /value3?queryKey=queryValue#!', { key: 'value' }, 'app');
        expect(nav.original).toBe('/app/path1//path2/   /value3?queryKey=queryValue#!');
        expect(nav.parsed).toBeDefined();
        expect(Object.keys(nav.parsed).length).toBe(0);
        expect(nav.data).toBeDefined()
        expect(nav.data.key).toBe('value');
        expect(nav.paths.length).toBe(3);
        expect(nav.paths[0]).toBe('path1');
        expect(nav.paths[1]).toBe('path2');
        expect(nav.paths[2]).toBe('value3');
        expect(nav.query).toBeDefined();
        expect(nav.query.queryKey).toBe('queryValue');
    });
});

describe('NavHandlerUtils.cleanPath', () => {
    it('removes the base path', () => {
        const path = NavHandlerUtils.cleanPath('/app/path', 'app');
        expect(path).toBe('path');
    });

    it('removes the base path when base is only part present', () => {
        const path = NavHandlerUtils.cleanPath('/app', 'app');
        expect(path).toBe('');
    });

    it('only removes the first base path match', () => {
        const path = NavHandlerUtils.cleanPath('/app/app/test/', 'app');
        expect(path).toBe('app/test/');
    });

    it('removes the base path and hash bang', () => {
        const path = NavHandlerUtils.cleanPath('/app/appz/test/#!', 'app');
        expect(path).toBe('appz/test/');
    });
});

describe('NavHandlerUtils.splitPathAndQuery', () => {
    it('splits path and query', () => {
        const { path, query } = NavHandlerUtils.splitPathAndQuery('/app/path?key=value');
        expect(path).toBe('/app/path');
        expect(query).toBe('key=value');
    })

    it('splits path without query', () => {
        const { path, query } = NavHandlerUtils.splitPathAndQuery('/app/path');
        expect(path).toBe('/app/path');
        expect(query).toBeNull();
    })

    it('splits path with empty query', () => {
        const { path, query } = NavHandlerUtils.splitPathAndQuery('/app/path?');
        expect(path).toBe('/app/path');
        expect(query).toBe('');
    })
});

describe('NavHandlerUtils.navTargetMatchesPattern', () => {
    it('does not match with non-fitting paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path/path');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(false);
    });

    it('does not match with fitting exact paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path/pathz', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path/path');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(false);
    });

    it('matches with fitting exact paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path1/path2');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(true);
    });

    it('matches with fitting present paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/:first/:second');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(true);
    });

    it('matches with fitting exact and present paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/:first/path2');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(true);
    });

    it('matches with fitting optional paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/?optional');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(true);
    });

    it('matches with non-fitting optional paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/?optional');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(true);
    });

    it('matches with multiple optional paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/?optional/?anotherOptional');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(true);
    });

    it('matches with multiple non-fitting optional paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/?optional/?anotherOptional');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(true);
    });

    it('matches with all match types paths present', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/12/exactPath/something/14', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/:aPath/:[int]numPath/exactPath/?optional/?[int]optionalInt');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(true);
    });

    it('matches with empty path', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/');
        const matched = NavHandlerUtils.navTargetMatchesPattern(target, pattern);
        expect(matched).toBe(true);
    });
});

describe('NavHandlerUtils.parsePathValues', () => {
    it('parses all path segments properly', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/12/exactPath/something/14', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/:aPath/:[int]numPath/exactPath/?optional/?[int]optionalInt/?missingOptional');
        const result = NavHandlerUtils.parsePathValues(target, pattern);
        expect(result.aPath).toBe('path1');
        expect(result.numPath).toBe(12);
        expect(result.exactPath).toBe('exactPath');
        expect(result.optional).toBe('something');
        expect(result.optionalInt).toBe(14);
        expect(result.missingOptional).toBeUndefined();
    });
});

describe("NavHandlerUtils.dataFitsPattern", () => {
    it('fits data with no optional paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path1/:second');
        const fits = NavHandlerUtils.dataFitsPattern(target, pattern);
        expect(fits).toBe(true);
    });

    it('doesn\'t fit data with no optional paths (under-fitted)', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path1/:second');
        const fits = NavHandlerUtils.dataFitsPattern(target, pattern);
        expect(fits).toBe(false);
    });

    it('doesn\'t fit data with no optional paths (over-fitted)', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2/path3', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path1/:second');
        const fits = NavHandlerUtils.dataFitsPattern(target, pattern);
        expect(fits).toBe(false);
    });

    it('fits data with all optionals with optional paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2/op1/op2', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path1/:second/?optional1/?optional2');
        const fits = NavHandlerUtils.dataFitsPattern(target, pattern);
        expect(fits).toBe(true);
    });

    it('fits data with some optionals with optional paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2/op1', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path1/:second/?optional1/?optional2');
        const fits = NavHandlerUtils.dataFitsPattern(target, pattern);
        expect(fits).toBe(true);
    });

    it('fits data with no optionals with optional paths', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path1/:second/?optional1/?optional2');
        const fits = NavHandlerUtils.dataFitsPattern(target, pattern);
        expect(fits).toBe(true);
    });

    it('doesn\'t fit data with optional paths (over-fitted)', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/path1/path2/op1/op2/path3', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path1/:second/?optional1/?optional2');
        const fits = NavHandlerUtils.dataFitsPattern(target, pattern);
        expect(fits).toBe(false);
    });

    it('doesn\'t fit data with optional paths (under-fitted)', () => {
        const target = NavHandlerUtils.buildNavigationTarget('/app/', {}, 'app');
        const pattern = NavHandlerUtils.parseMatches('/path1/:second/?optional1/?optional2');
        const fits = NavHandlerUtils.dataFitsPattern(target, pattern);
        expect(fits).toBe(false);
    });
});

describe("NavHandlerUtils.maxPatternIndex", () => {
    it('returns -1 for empty pattern', () => {
        const pattern = NavHandlerUtils.parseMatches('/');
        const index = NavHandlerUtils.maxPatternIndex(pattern);
        expect(index).toBe(-1);
    });

    it('returns index with optionals for pattern', () => {
        const pattern = NavHandlerUtils.parseMatches('/path/:value/?optional');
        const index = NavHandlerUtils.maxPatternIndex(pattern);
        expect(index).toBe(2);
    });

    it('returns index without optionals for pattern without optional', () => {
        const pattern = NavHandlerUtils.parseMatches('/path/:value/:notOptional');
        const index = NavHandlerUtils.maxPatternIndex(pattern, false);
        expect(index).toBe(2);
    });

    it('returns index without optionals for pattern with optional', () => {
        const pattern = NavHandlerUtils.parseMatches('/path/:value/?optional');
        const index = NavHandlerUtils.maxPatternIndex(pattern, false);
        expect(index).toBe(1);
    });

    it('returns -1 without optionals for pattern with all optionals', () => {
        const pattern = NavHandlerUtils.parseMatches('/?path/?value/?optional');
        const index = NavHandlerUtils.maxPatternIndex(pattern, false);
        expect(index).toBe(-1);
    });
});