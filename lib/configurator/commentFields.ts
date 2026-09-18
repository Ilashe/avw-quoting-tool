/**
 * Comment tab (2026-09-18 client request): a free-text note the salesperson types, which only
 * reaches the Quote Summary — and from there the Review page and the generated PDF — once they
 * click Next. QUOTE_COMMENT_DRAFT_FIELD is what the textarea is bound to (so an unfinished note
 * still survives autosave and a reload); QUOTE_COMMENT_FIELD is the committed copy Next writes.
 */
export const QUOTE_COMMENT_DRAFT_FIELD = 'quote_comment_draft'
export const QUOTE_COMMENT_FIELD = 'quote_comment'
