import { pollService } from './pollService';
import { petitionService } from './petitionService'; // Assuming you have this
// import { reportService } from './reportService'; // Assuming you have this

export const searchService = {
  // Search across all content types
  searchAll: async (query) => {
    if (!query || query.trim().length < 2) {
      return { polls: [], petitions: [], reports: [], total: 0 };
    }

    const searchTerm = query.toLowerCase().trim();
    const results = { polls: [], petitions: [], reports: [], total: 0 };

    try {
      // Search polls
      const polls = await pollService.getPolls();
      results.polls = polls.filter(poll => 
        poll.question?.toLowerCase().includes(searchTerm) ||
        poll.description?.toLowerCase().includes(searchTerm) ||
        poll.location?.toLowerCase().includes(searchTerm) ||
        poll.category?.toLowerCase().includes(searchTerm) ||
        poll.options?.some(option => 
          (typeof option === 'string' ? option : option.text)?.toLowerCase().includes(searchTerm)
        )
      ).map(poll => ({
        ...poll,
        type: 'poll',
        title: poll.question,
        snippet: poll.description,
        url: `/dashboard/polls`,
        highlights: getHighlights(poll, searchTerm)
      }));

      // Search petitions (if service exists)
      try {
        if (petitionService && petitionService.getPetitions) {
          const petitions = await petitionService.getPetitions();
          results.petitions = petitions.filter(petition => 
            petition.title?.toLowerCase().includes(searchTerm) ||
            petition.description?.toLowerCase().includes(searchTerm) ||
            petition.location?.toLowerCase().includes(searchTerm) ||
            petition.category?.toLowerCase().includes(searchTerm)
          ).map(petition => ({
            ...petition,
            type: 'petition',
            title: petition.title,
            snippet: petition.description,
            url: `/dashboard/petitions`,
            highlights: getHighlights(petition, searchTerm)
          }));
        }
      } catch (err) {
        console.log('Petition search not available:', err);
      }

      // Search reports (if service exists)
      try {
        // Uncomment when reportService is available
        // if (reportService && reportService.getReports) {
        //   const reports = await reportService.getReports();
        //   results.reports = reports.filter(report => 
        //     report.title?.toLowerCase().includes(searchTerm) ||
        //     report.description?.toLowerCase().includes(searchTerm) ||
        //     report.location?.toLowerCase().includes(searchTerm)
        //   ).map(report => ({
        //     ...report,
        //     type: 'report',
        //     title: report.title,
        //     snippet: report.description,
        //     url: `/dashboard/reports`,
        //     highlights: getHighlights(report, searchTerm)
        //   }));
        // }
      } catch (err) {
        console.log('Report search not available:', err);
      }

      results.total = results.polls.length + results.petitions.length + results.reports.length;
      return results;

    } catch (error) {
      console.error('Search error:', error);
      return { polls: [], petitions: [], reports: [], total: 0, error: error.message };
    }
  }
};

// Helper function to get highlighted text matches
const getHighlights = (item, searchTerm) => {
  const highlights = [];
  
  const fields = [
    { key: 'question', label: 'Question' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'location', label: 'Location' },
    { key: 'category', label: 'Category' }
  ];

  fields.forEach(field => {
    if (item[field.key] && item[field.key].toLowerCase().includes(searchTerm)) {
      const text = item[field.key];
      const index = text.toLowerCase().indexOf(searchTerm);
      const start = Math.max(0, index - 30);
      const end = Math.min(text.length, index + searchTerm.length + 30);
      let snippet = text.substring(start, end);
      
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
      
      highlights.push({
        field: field.label,
        text: snippet,
        searchTerm
      });
    }
  });

  return highlights;
};

// Helper function to highlight search term in text
export const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark style="background-color: #ADFF2F; padding: 1px 2px; border-radius: 2px;">$1</mark>');
};