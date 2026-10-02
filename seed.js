// Run with: npm run seed   (creates an admin account + sample quizzes)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
const Quiz = require('./models/Quiz');

function q(text, options, correctIndex, category, difficulty, explanation) {
  return { text, options, correctIndex, category, difficulty, explanation };
}

const quizzes = [
  {
    title: 'Web Development Basics',
    description: 'A quick check on JavaScript, React, Node and MongoDB fundamentals.',
    category: 'Web',
    durationMinutes: 5,
    questions: [
      q('Which hook is used to manage state in a React function component?', ['useEffect', 'useState', 'useRef', 'useMemo'], 1, 'React', 'easy', 'useState returns a state value and a setter.'),
      q('What does JSX stand for?', ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extra'], 0, 'React', 'easy', 'JSX is a syntax extension that lets you write HTML-like markup in JavaScript.'),
      q('Which method creates a new array from calling a function on every element?', ['forEach', 'filter', 'map', 'reduce'], 2, 'JavaScript', 'easy', 'map returns a new array with the callback results.'),
      q('What is the output of typeof null?', ['"null"', '"undefined"', '"object"', '"number"'], 2, 'JavaScript', 'medium', 'A long-standing quirk: typeof null is "object".'),
      q('Which HTTP status code means "Not Found"?', ['200', '301', '404', '500'], 2, 'Web', 'easy', '404 means the resource could not be found.'),
      q('In Express, which function is used to register middleware?', ['app.use()', 'app.listen()', 'app.render()', 'app.engine()'], 0, 'Node.js', 'medium', 'app.use mounts middleware functions.'),
      q('MongoDB stores data in which format?', ['Tables', 'BSON documents', 'CSV rows', 'XML nodes'], 1, 'MongoDB', 'easy', 'Documents are stored as BSON (binary JSON).'),
      q('Which of these is NOT a JavaScript primitive type?', ['string', 'boolean', 'array', 'symbol'], 2, 'JavaScript', 'medium', 'Arrays are objects, not primitives.'),
    ],
  },
  {
    title: 'JavaScript Essentials',
    description: 'Closures, equality, arrays, and how the language actually behaves.',
    category: 'JavaScript',
    durationMinutes: 8,
    questions: [
      q('Which comparison is both value and type strict?', ['==', '===', '=', '!='], 1, 'JavaScript', 'easy', '=== does not coerce types.'),
      q('What does Array.prototype.filter return?', ['The first matching item', 'A new array of matching items', 'true or false', 'The original array mutated'], 1, 'JavaScript', 'easy', 'filter always returns a new array.'),
      q('A closure is a function that remembers:', ['Only global variables', 'Variables from its lexical environment', 'The call stack size', 'The prototype chain only'], 1, 'JavaScript', 'medium', 'Closures capture the surrounding scope.'),
      q('Which keyword declares a block-scoped variable that cannot be reassigned?', ['var', 'let', 'const', 'static'], 2, 'JavaScript', 'easy', 'const is block-scoped and cannot be reassigned.'),
      q('What is NaN === NaN?', ['true', 'false', 'undefined', 'throws an error'], 1, 'JavaScript', 'medium', 'NaN is not equal to itself; use Number.isNaN.'),
      q('Which method waits for all promises to settle (fulfill or reject)?', ['Promise.all', 'Promise.race', 'Promise.allSettled', 'Promise.any'], 2, 'JavaScript', 'medium', 'allSettled resolves when every promise finishes.'),
      q('What does JSON.parse(\'"hi"\') return?', ['"hi" with quotes', 'the string hi', 'an object', 'an error'], 1, 'JavaScript', 'medium', 'A JSON string value becomes a JS string.'),
      q('In JavaScript, functions are:', ['Not first-class', 'First-class objects', 'Only constructors', 'Compiled to classes'], 1, 'JavaScript', 'easy', 'You can pass, return, and assign functions.'),
    ],
  },
  {
    title: 'React Fundamentals',
    description: 'Components, hooks, keys, and how React updates the UI.',
    category: 'React',
    durationMinutes: 8,
    questions: [
      q('What must you return from a React component?', ['A promise', 'Valid JSX / null', 'A CSS file', 'A database query'], 1, 'React', 'easy', 'Components render UI (or null).'),
      q('Why do list items need a stable key?', ['For CSS animation only', 'To help React match items across renders', 'To make arrays sortable', 'Keys are optional and unused'], 1, 'React', 'easy', 'Keys identify items so React can reuse DOM nodes.'),
      q('useEffect runs after:', ['The first paint of the commit', 'The browser paint of the committed render (by default)', 'JSON.parse', 'Mongo inserts'], 1, 'React', 'medium', 'Effects run after paint unless you use a layout effect.'),
      q('Which hook is for values that persist without causing a re-render when changed?', ['useState', 'useMemo', 'useRef', 'useReducer'], 2, 'React', 'medium', 'Updating a ref does not re-render.'),
      q('Props in React are:', ['Mutable by the child', 'Read-only from the child\'s perspective', 'Always strings', 'Stored in localStorage'], 1, 'React', 'easy', 'Children should not mutate props.'),
      q('What does lifting state up mean?', ['Putting state in useRef', 'Moving shared state to a common parent', 'Using Redux only', 'Hiding state in CSS'], 1, 'React', 'medium', 'A parent owns state used by siblings.'),
      q('React Router\'s <Link> is preferred over <a> because it:', ['Is required by HTML', 'Navigates without a full page reload', 'SEO-blocks the page', 'Disables CSS'], 1, 'React', 'easy', 'Client-side routing keeps app state.'),
      q('When does React re-render a function component?', ['On every mouse move', 'When its state or parent-driven props change', 'Only at midnight', 'Never after mount'], 1, 'React', 'easy', 'State/props (and context) changes trigger renders.'),
    ],
  },
  {
    title: 'HTML & CSS',
    description: 'Markup, layout, selectors, and accessible structure.',
    category: 'Frontend',
    durationMinutes: 7,
    questions: [
      q('Which tag defines the main heading of a page?', ['<h1>', '<head>', '<header>', '<title>'], 0, 'HTML', 'easy', '<h1> is the top-level heading in the document outline.'),
      q('What does CSS stand for?', ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Syntax Styles', 'Colorful Styling System'], 1, 'CSS', 'easy', 'Styles cascade by specificity and source order.'),
      q('Which display value creates a flex formatting context?', ['block', 'inline', 'flex', 'table'], 2, 'CSS', 'easy', 'display: flex enables flex layout for children.'),
      q('The box model width by default includes:', ['content only (content-box)', 'padding and border always', 'margin', 'outline'], 0, 'CSS', 'medium', 'content-box is the default; border-box includes padding and border.'),
      q('Which attribute provides an accessible name for an image?', ['title', 'alt', 'srcset', 'rel'], 1, 'HTML', 'easy', 'alt describes the image for assistive tech.'),
      q('What does position: relative do?', ['Removes the element from flow', 'Positions relative to its normal position', 'Always sticks to the viewport', 'Creates a 3D cube'], 1, 'CSS', 'medium', 'Offsets apply relative to where it would have been.'),
      q('Which selector has the highest specificity among these?', ['.card', '#main', 'div p', '*'], 1, 'CSS', 'medium', 'IDs beat classes, elements, and the universal selector.'),
      q('<label for="email"> should match an input with:', ['name="email"', 'id="email"', 'class="email"', 'value="email"'], 1, 'HTML', 'easy', 'The for attribute maps to the input\'s id.'),
    ],
  },
  {
    title: 'Python Basics',
    description: 'Types, lists, functions, and common Python gotchas.',
    category: 'Python',
    durationMinutes: 8,
    questions: [
      q('How do you start a comment in Python?', ['//', '/*', '#', '<!--'], 2, 'Python', 'easy', '# starts a comment to the end of the line.'),
      q('Which type is immutable?', ['list', 'dict', 'set', 'tuple'], 3, 'Python', 'easy', 'Tuples cannot be changed after creation.'),
      q('What does len("quiz") return?', ['3', '4', '5', 'error'], 1, 'Python', 'easy', 'There are four characters.'),
      q('Which keyword defines a function?', ['func', 'function', 'def', 'lambda only'], 2, 'Python', 'easy', 'def name(...): starts a function.'),
      q('What is the result of 7 // 2?', ['3.5', '3', '4', '2'], 1, 'Python', 'medium', '// is floor division.'),
      q('How do you create a virtual environment with venv?', ['pip env', 'python -m venv .venv', 'npm venv', 'conda only'], 1, 'Python', 'medium', 'The venv module is in the standard library.'),
      q('Which collection is unordered and unique?', ['list', 'tuple', 'set', 'str'], 2, 'Python', 'easy', 'Sets store unique, unordered items.'),
      q('What does None represent?', ['The number 0', 'An empty string', 'The absence of a value', 'False always'], 2, 'Python', 'easy', 'None is a singleton null-like object.'),
    ],
  },
  {
    title: 'Data Structures',
    description: 'Arrays, stacks, queues, trees, and Big-O intuition.',
    category: 'CS',
    durationMinutes: 10,
    questions: [
      q('A stack follows which order?', ['FIFO', 'LIFO', 'Random', 'Sorted'], 1, 'CS', 'easy', 'Last in, first out.'),
      q('A queue follows which order?', ['LIFO', 'FIFO', 'LRU', 'MRU'], 1, 'CS', 'easy', 'First in, first out.'),
      q('Average time to search an unsorted array is:', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 2, 'CS', 'medium', 'You may scan every element.'),
      q('Binary search requires the array to be:', ['A linked list', 'Sorted', 'A hash table', 'Empty'], 1, 'CS', 'easy', 'Halving only works on ordered data.'),
      q('Which structure is best for fast average lookup by key?', ['Array', 'Hash table / map', 'Queue', 'Stack'], 1, 'CS', 'easy', 'Hash maps average O(1) get/set.'),
      q('A binary tree node typically has:', ['Exactly 3 children', 'Up to 2 children', 'Unlimited children', 'No children ever'], 1, 'CS', 'easy', 'Binary means at most two children.'),
      q('DFS on a graph commonly uses:', ['A queue only', 'A stack or recursion', 'Only sorting', 'Counting sort'], 1, 'CS', 'medium', 'Recursion/stack explore deep paths first.'),
      q('BFS on a graph commonly uses:', ['A stack', 'A queue', 'A heap only', 'A Bloom filter'], 1, 'CS', 'medium', 'A queue visits neighbors level by level.'),
    ],
  },
  {
    title: 'Git & GitHub',
    description: 'Commits, branches, remotes, and everyday version control.',
    category: 'Tools',
    durationMinutes: 6,
    questions: [
      q('What does git clone do?', ['Deletes a repo', 'Copies a remote repository locally', 'Creates a GitHub issue', 'Runs tests'], 1, 'Git', 'easy', 'Clone downloads the repo and sets origin.'),
      q('git commit records changes in:', ['The remote only', 'The local repository', 'package.json', 'The browser cache'], 1, 'Git', 'easy', 'Commits are local until you push.'),
      q('Which command uploads commits to a remote?', ['git pull', 'git fetch', 'git push', 'git stash'], 2, 'Git', 'easy', 'push sends local commits to origin.'),
      q('A branch is:', ['A deleted commit', 'A movable pointer to a commit', 'A GitHub user', 'A CSS file'], 1, 'Git', 'medium', 'HEAD often points at a branch name.'),
      q('git pull is roughly:', ['push + merge', 'fetch + integrate', 'clone + reset', 'stash + drop'], 1, 'Git', 'medium', 'Pull fetches then merges or rebases.'),
      q('What is a pull request?', ['Deleting the main branch', 'A proposal to merge changes for review', 'A Mongo query', 'An npm script'], 1, 'GitHub', 'easy', 'PRs let teammates review before merge.'),
      q('.gitignore is used to:', ['Ignore merge conflicts forever', 'Exclude files from version control', 'Delete GitHub', 'Format Python'], 1, 'Git', 'easy', 'Listed paths are not tracked.'),
      q('HEAD usually points to:', ['The oldest commit', 'Your current branch or commit', 'package-lock.json', 'The README only'], 1, 'Git', 'medium', 'HEAD is where you are in history.'),
    ],
  },
  {
    title: 'General Aptitude',
    description: 'Quick logic, percentages, and verbal reasoning for practice tests.',
    category: 'Aptitude',
    durationMinutes: 10,
    questions: [
      q('If 20% of 150 is x, what is x?', ['20', '25', '30', '35'], 2, 'Math', 'easy', '0.2 × 150 = 30.'),
      q('A train travels 60 km in 1.5 hours. Average speed is:', ['30 km/h', '40 km/h', '45 km/h', '90 km/h'], 1, 'Math', 'easy', '60 / 1.5 = 40 km/h.'),
      q('Find the next number: 2, 6, 12, 20, 30, ?', ['36', '40', '42', '44'], 2, 'Logic', 'medium', 'Add 4, 6, 8, 10, 12 → 42.'),
      q('All roses are flowers. Some flowers fade quickly. Therefore:', ['All roses fade quickly', 'Some roses may or may not fade quickly; it is not certain', 'No roses are flowers', 'Flowers are roses'], 1, 'Logic', 'medium', 'The some-flowers set may not include roses.'),
      q('If A is taller than B and B is taller than C, then:', ['C is tallest', 'A is taller than C', 'B is shortest', 'Heights are equal'], 1, 'Logic', 'easy', 'Transitive comparison.'),
      q('Simple interest on 1000 at 10% per year for 2 years is:', ['100', '150', '200', '220'], 2, 'Math', 'easy', 'SI = PRT/100 = 1000×10×2/100 = 200.'),
      q('Choose the odd one out: Monday, Friday, Sunday, January', ['Monday', 'Friday', 'Sunday', 'January'], 3, 'Verbal', 'easy', 'January is a month, the others are days.'),
      q('A shop offers 10% off 200. Sale price is:', ['180', '190', '210', '220'], 0, 'Math', 'easy', '10% of 200 is 20; 200 − 20 = 180.'),
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = (process.env.ADMIN_EMAIL || 'admin@quiz.com').toLowerCase();
  if (!(await User.findOne({ email }))) {
    await User.create({ name: 'Admin', email, password: process.env.ADMIN_PASSWORD || 'admin123', role: 'admin' });
    console.log(`Admin created: ${email}`);
  } else console.log('Admin already exists');

  for (const quiz of quizzes) {
    const existing = await Quiz.findOne({ title: quiz.title });
    if (existing) {
      console.log(`Skip existing quiz: ${quiz.title}`);
      continue;
    }
    const docs = await Question.insertMany(quiz.questions);
    await Quiz.create({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      durationMinutes: quiz.durationMinutes,
      questions: docs.map((d) => d._id),
    });
    console.log(`Created quiz: ${quiz.title} (${docs.length} questions)`);
  }

  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
