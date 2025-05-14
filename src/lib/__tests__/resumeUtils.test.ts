import {
  sanitizeFilename,
  formatDate,
  createDefaultResume,
  getResumeFileExtension,
  isValidResumeName
} from '../resumeUtils';
import '@testing-library/jest-dom';

describe('Resume Utilities', () => {
  describe('sanitizeFilename', () => {
    test.each([
      ['resume/with/slashes', 'resume-with-slashes'],
      ['resume\\with\\backslashes', 'resume-with-backslashes'],
      ['resume?with?questions', 'resume-with-questions'],
      ['resume%with%percent', 'resume-with-percent'],
      ['resume*with*stars', 'resume-with-stars'],
      ['resume:with:colons', 'resume-with-colons'],
      ['resume|with|pipes', 'resume-with-pipes'],
      ['resume"with"quotes', 'resume-with-quotes'],
      ['resume<with>brackets', 'resume-with-brackets'],
    ])('sanitizes %s to %s', (input, expected) => {
      expect(sanitizeFilename(input)).toBe(expected);
    });

    test('preserves safe characters', () => {
      const safeCharacters = [
        'resume-with-dashes',
        'resume_with_underscores',
        'resume.with.dots',
        'resume with spaces',
        'resume123'
      ];

      safeCharacters.forEach(input => {
        expect(sanitizeFilename(input)).toBe(input);
      });
    });

    test('handles edge cases', () => {
      // Empty string
      expect(sanitizeFilename('')).toBe('');
      
      // String with only invalid characters
      expect(sanitizeFilename('//////')).toBe('------');
      
      // Mixed case
      expect(sanitizeFilename('ReSuMe/WiTh/SlAsHeS')).toBe('ReSuMe-WiTh-SlAsHeS');
      
      // Unicode characters should be preserved
      expect(sanitizeFilename('résumé-with-accents')).toBe('résumé-with-accents');
    });
  });

  describe('formatDate', () => {
    test('formats dates with correct month and year', () => {
      const testCases = [
        { date: new Date(2021, 0, 1), expected: 'January 2021' },
        { date: new Date(2022, 11, 31), expected: 'December 2022' },
        { date: new Date(2023, 6, 15), expected: 'July 2023' }
      ];

      testCases.forEach(({ date, expected }) => {
        expect(formatDate(date)).toBe(expected);
      });
    });

    test('handles month boundaries correctly', () => {
      expect(formatDate(new Date(2021, 0, 1))).toBe('January 2021');
      expect(formatDate(new Date(2021, 11, 31))).toBe('December 2021');
    });
  });

  describe('createDefaultResume', () => {
    test('creates resume with provided name', () => {
      const resume = createDefaultResume('John Doe');
      expect(resume).toContain('# John Doe');
    });

    test('creates resume with default name when none provided', () => {
      const resume = createDefaultResume();
      expect(resume).toContain('# Your Name');
    });

    test('includes all required sections', () => {
      const resume = createDefaultResume();
      
      // Check for all required sections
      const requiredSections = [
        '## Summary',
        '## Experience',
        '## Education',
        '## Skills',
        '## Projects',
        '## Certifications'
      ];

      requiredSections.forEach(section => {
        expect(resume).toContain(section);
      });
    });

    test('has proper markdown structure', () => {
      const resume = createDefaultResume('Test User');
      
      // Check basic structure
      const lines = resume.split('\n');
      
      // Title should be first line
      expect(lines[0]).toBe('# Test User');
      
      // Should have contact info
      expect(resume).toContain('email@example.com');
      expect(resume).toContain('(123) 456-7890');
      
      // Should have section separators
      expect(resume).toContain('---');
    });
  });

  describe('getResumeFileExtension', () => {
    test('returns empty string for filenames with .md extension', () => {
      expect(getResumeFileExtension('resume.md')).toBe('');
      expect(getResumeFileExtension('my-resume.md')).toBe('');
    });

    test('returns .md for filenames with no extension', () => {
      expect(getResumeFileExtension('resume')).toBe('.md');
      expect(getResumeFileExtension('my-resume')).toBe('.md');
    });

    test('returns .md for filenames with different extension', () => {
      expect(getResumeFileExtension('resume.txt')).toBe('.md');
      expect(getResumeFileExtension('resume.pdf')).toBe('.md');
    });

    test('handles edge cases', () => {
      // Empty string
      expect(getResumeFileExtension('')).toBe('.md');
      
      // Multiple dots
      expect(getResumeFileExtension('resume.backup.md')).toBe('');
      
      // Just an extension
      expect(getResumeFileExtension('.md')).toBe('');
    });
  });

  describe('isValidResumeName', () => {
    test('returns true for valid resume names', () => {
      const validNames = [
        'resume',
        'My Resume',
        'resume-2023',
        'resume_v1',
        'resume.new',
        'a'.repeat(254) // Within allowed length
      ];

      validNames.forEach(name => {
        expect(isValidResumeName(name)).toBe(true);
      });
    });

    test('returns false for empty resume names', () => {
      const emptyNames = [
        '',
        '   ',
        '\t',
        '\n'
      ];

      emptyNames.forEach(name => {
        expect(isValidResumeName(name)).toBe(false);
      });
    });

    test('returns false for too long resume names', () => {
      const tooLong = 'a'.repeat(256);
      expect(isValidResumeName(tooLong)).toBe(false);
    });

    test('handles edge cases', () => {
      // Exactly at the limit
      expect(isValidResumeName('a'.repeat(255))).toBe(true);
      
      // Just over the limit
      expect(isValidResumeName('a'.repeat(256))).toBe(false);
      
      // Whitespace-only names (should be invalid)
      expect(isValidResumeName('   ')).toBe(false);
      
      // Name with just whitespace at edges (should trim)
      expect(isValidResumeName('  valid  ')).toBe(true);
    });
  });
});