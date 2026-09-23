/**
 * Generate a branch name from a card title.
 */
export function generateBranchName(cardTitle) {
  let branch = cardTitle
    .replace(/"/g, '')
    .replace(/[^\w\s-]/g, '')
    .toLowerCase()
    .trim();

  branch = branch
    .replace(/^(orders?\s*&\s*cart|cart\s*&\s*orders?)\s*/i, 'orders-cart-')
    .replace(/^(order\s*entity|orders?)\s*/i, 'order-')
    .replace(/^(product\s*listing|productlisting)\s*/i, 'product-listing-')
    .replace(/^(stores?)\s*/i, 'store-')
    .replace(/^(payment|payments?)\s*/i, 'payment-')
    .replace(/^(escrow)\s*/i, 'escrow-')
    .replace(/^(auction|auctions?)\s*/i, 'auction-')
    .replace(/^(bid|bidding|bids?)\s*/i, 'bid-')
    .replace(/^(search)\s*/i, 'search-')
    .replace(/^(dashboard)\s*/i, 'dashboard-')
    .replace(/^(review|reviews?)\s*/i, 'review-')
    .replace(/^(admin)\s*/i, 'admin-')
    .replace(/^(notification|notifications?)\s*/i, 'notification-')
    .replace(/^(weekend\s*work|weekend)\s*/i, 'weekend-')
    .replace(/^(week\s*\d+)\s*/i, 'week-')
    .replace(/\s*-\s*week\s*\d+/i, '');

  let prefix = 'feat';
  const lowerTitle = cardTitle.toLowerCase();

  if (lowerTitle.includes('bug') || lowerTitle.includes('fix')) {
    prefix = 'fix';
  } else if (lowerTitle.includes('refactor')) {
    prefix = 'refactor';
  } else if (lowerTitle.includes('test') || lowerTitle.includes('testing')) {
    prefix = 'test';
  } else if (lowerTitle.includes('doc') || lowerTitle.includes('documentation')) {
    prefix = 'docs';
  } else if (lowerTitle.includes('review') || lowerTitle.includes('weekend')) {
    prefix = 'chore';
  }

  branch = branch
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  return `${prefix}/${branch}`;
}
