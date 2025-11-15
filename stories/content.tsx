/**
 * Shared content for Highlight and useHighlight stories
 * These are JSX elements (not components) for reusable demonstration content
 */

export const AboutHighlightContent = (
  <>
    <h2>About the Highlight Component</h2>
    <p>
      Highlight is a powerful, zero-dependency React component for highlighting
      text using the modern CSS Custom Highlight API. It uses TreeWalker for
      blazing-fast DOM traversal, making it 500× faster than naive approaches.
      The component is non-invasive and has zero impact on your DOM structure
      or React component tree.
    </p>
    <p>
      This hook provides direct access to highlight state, making it easy
      to build custom UI components that display match counts, handle
      errors, and respond to browser support.
    </p>
  </>
);

export const AboutTextHighlightingContent = (
  <>
    <h2>About Text Highlighting</h2>
    <p>
      Text highlighting is a powerful feature that helps users quickly
      identify relevant content. The CSS Custom Highlight API enables
      efficient, non-invasive text highlighting without DOM manipulation.
    </p>
    <p>
      This hook provides direct access to highlight state, making it easy
      to build custom UI components that display match counts, handle
      errors, and respond to browser support.
    </p>
  </>
);

export const ReactEcosystemContent = (
  <>
    <h2>The React Ecosystem</h2>
    <p>
      React is a JavaScript library for building user interfaces. React
      makes it painless to create interactive UIs. Design simple views for
      each state in your application, and React will efficiently update and
      render just the right components when your data changes.
    </p>
    <p>
      React components implement a render() method that takes input data
      and returns what to display. This example uses JSX syntax which is
      similar to XML. Input data passed into the component can be accessed
      by render() via this.props.
    </p>
    <p>
      In addition to taking input data, a component can maintain internal
      state data. When a component's state data changes, the rendered
      markup will be updated by re-invoking render().
    </p>
  </>
);

export const SystemLogContent = (
  <>
    <h2>System Log Messages</h2>
    <p>
      <strong>[2024-01-15 10:30:00]</strong> Error: Database connection
      failed. Unable to establish connection to primary database.
    </p>
    <p>
      <strong>[2024-01-15 10:30:05]</strong> Warning: Retrying connection
      with backup server. Caution: This may result in slower performance.
    </p>
    <p>
      <strong>[2024-01-15 10:30:10]</strong> Success: Connection
      established with backup server. Issue resolved.
    </p>
    <p>
      <strong>[2024-01-15 10:35:00]</strong> Error: Failed to process
      transaction #12345. Bug detected in payment processing module.
    </p>
    <p>
      <strong>[2024-01-15 10:35:30]</strong> Success: Transaction #12345
      successfully retried and fixed. All systems operational.
    </p>
  </>
);

// Alias for backward compatibility
export const MultiTermLogContent = SystemLogContent;

export const TestContent = (
  <>
    <h2>Test Content</h2>
    <p>
      This is a test paragraph with test content for testing the
      highlighting functionality. The test should work properly if the
      browser supports the CSS Custom Highlight API.
    </p>
    <p>
      Test various scenarios to ensure the test cases cover all test
      requirements. Testing is an important part of software development.
    </p>
  </>
);

export const ComputingHistoryContent = (
  <>
    <h2>The History of Computing</h2>
    <p>
      The history of computing is longer than the history of computing
      hardware and modern computing technology and includes the history of
      methods intended for pen and paper or for chalk and slate, with or
      without the aid of tables.
    </p>
    <p>
      Computing is intimately tied to the representation of numbers. But
      long before abstractions like the number arose, there were
      mathematical concepts to serve the purposes of civilization. These
      concepts are implicit in concrete practices such as: one-to-one
      correspondence, a rule to determine which of two collections has more
      members.
    </p>
    <p>
      The abacus was initially used for arithmetic tasks. The Roman abacus
      was used in Babylonia as early as 2400 BC. Since then, many other
      forms of reckoning boards or tables have been invented. In a medieval
      European counting house, a checkered cloth would be placed on a table,
      and markers moved around on it according to certain rules, as an aid
      to calculating sums of money.
    </p>
    <p>
      The Antikythera mechanism is believed to be the earliest mechanical
      analog computer, according to Derek J. de Solla Price. It was designed
      to calculate astronomical positions. It was discovered in 1901 in the
      Antikythera wreck off the Greek island of Antikythera, between Kythera
      and Crete, and has been dated to circa 100 BC.
    </p>
    <p>
      Several analog computers were constructed between the years 1930-1945.
      Among these were the Norden bombsight and the mechanical computers of
      Vannevar Bush. The art of mechanical analog computing reached its
      zenith with the differential analyzer, built by H. L. Hazen and
      Vannevar Bush at MIT starting in 1927.
    </p>
  </>
);

export const LoremIpsumContent = (
  <>
    <h2>Lorem Ipsum</h2>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </p>
    <p>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
      dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p>
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
      doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
      veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </p>
  </>
);

export const ShortTextContent = (
  <>
    <p>
      This is a short paragraph for quick testing. It contains common words
      like the, and, but, with repeated elements for testing purposes.
    </p>
  </>
);

export const AboutHighlightComponentContent = (
  <>
    <h2>About the Highlight Component</h2>
    <p>
      Highlight is a powerful, zero-dependency React component for highlighting
      text using the modern CSS Custom Highlight API. It uses TreeWalker for
      blazing-fast DOM traversal, making it 500× faster than naive approaches.
      The component is non-invasive and has zero impact on your DOM structure
      or React component tree.
    </p>
    <p>
      The Highlight component supports multiple search terms, case sensitivity,
      whole word matching, and fully customizable CSS styling. It offers two
      usage patterns: a ref-based API for power users and complex scenarios, and
      a wrapper component for simple use cases. The component works seamlessly
      with React portals and complex layouts.
    </p>
  </>
);

export const DataProcessingContent = (
  <>
    <h2>Data Processing</h2>
    <p>
      Data analysis involves collecting, processing, and analyzing DATA to
      extract meaningful insights. Raw data must be cleaned and transformed
      before analysis. The data pipeline ensures data quality and consistency.
    </p>
    <p>
      Big Data technologies handle massive datasets that traditional data
      processing software cannot manage. Data scientists use statistical
      methods to find patterns in data and make data-driven decisions.
    </p>
  </>
);

export const WholeWordExampleContent = (
  <>
    <p>
      The cat sat on the mat. The catalog contains many categories of
      concatenated strings. Scattered throughout, you'll find cats and their
      catastrophic adventures.
    </p>
    <p>
      Without whole word matching: highlights "cat" in catalog, categories,
      concatenated, scattered, cats, catastrophic
    </p>
    <p>With whole word matching: only highlights the standalone word "cat"</p>
  </>
);

export const CustomStylingContent = (
  <>
    <h2>Custom Styling</h2>
    <p>
      This is an important message with important information. It's important
      to note that custom CSS can be applied to highlights using the
      highlightName prop and custom ::highlight() styles.
    </p>
  </>
);

export const SystemStatusContent = (
  <>
    <h2>System Status</h2>
    <p>success: All systems operational</p>
    <p>warning: High CPU usage detected</p>
    <p>error: Database connection failed</p>
    <p>success: Automatic recovery completed</p>
    <p>warning: Cache memory nearly full</p>
  </>
);

export const WrapperExampleContent = (
  <>
    <h4>Simple Wrapper Usage</h4>
    <p>
      This is an important message about important topics. The wrapper
      pattern is important for simple use cases where you don't need multiple
      highlights or advanced features.
    </p>
    <p>
      Notice how you don't need to manage refs manually - the wrapper handles
      it for you! This is important for developer experience.
    </p>
  </>
);

export const SimpleExampleContent = (
  <p>
    This is a simple example with simple highlighting. Perfect for
    simple use cases!
  </p>
);

export const MultipleHighlightsContent = (
  <p>
    You can have multiple highlights on the same content! This shows both
    "multiple" and "highlights" with different styles.
  </p>
);

export const AboutHighlightWrapperContent = (
  <>
    <h2>About the HighlightWrapper</h2>
    <p>
      This is an important message about important topics. The wrapper
      pattern is important for simple use cases where you don't need multiple
      highlights or advanced features.
    </p>
    <p>
      Notice how you don't need to manage refs manually - the wrapper handles
      it for you! This is important for developer experience and keeps your
      code clean and simple.
    </p>
    <p>
      The HighlightWrapper component is perfect when you have a single
      highlight target and want the simplest possible API. For more advanced
      use cases like multiple highlights on the same content, use the
      Highlight component directly with refs.
    </p>
  </>
);

