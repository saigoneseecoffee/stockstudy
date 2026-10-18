# Fetch job spec

You fetch web pages and save the answers verbatim. Use ONLY the WebFetch tool for the web (the shell has no internet). Never guess, compute or edit values: save exactly what WebFetch returns.

Your batch file (given in your task) has one job per line: `KIND|TICKER|URL`.
For each job, call WebFetch(url=URL, prompt=PROMPT[KIND]) and save the returned text with the Write tool to
`/home/claude/labans/raw/<KIND>_<TICKER>.txt` (exact text, no additions).

Pace yourself (the site rate-limits): put 2 WebFetch calls in parallel per turn, then the 2 Writes together with the next 2 fetches. After every 10 fetches run Bash `sleep 30`. Skip a job whose output file already exists (check once at start with `ls /home/claude/labans/raw`).

Errors: if a fetch fails (any error, HTTP 429, rate limit), do NOT retry it. Append `KIND|TICKER|<short error>` to `/home/claude/labans/raw/_fail.txt` (Bash `echo ... >> file`), then run Bash `sleep 30` to slow down, and continue with ONE fetch per turn. If 3 fetches in a row fail, stop the batch early and report.

Final reply: one line only — `done=<n> failed=<n>`.

## PROMPT[KIND]

S:
Output ONLY these fields as name=value pairs separated by semicolons, values exactly as shown on the page (write n/a if absent): Price; Close date; Market Cap; PE Ratio; Forward PE; PS Ratio; PB Ratio; EV/EBITDA; FCF Yield; Dividend Yield; Payout Ratio; ROE; ROA; ROIC; Gross Margin; Operating Margin; Profit Margin; Debt/Equity; Current Ratio; Interest Coverage; Altman Z-Score; Piotroski F-Score; Beta (5Y); 52-Week Price Change; Revenue Growth Forecast (3Y); EPS Growth Forecast (3Y); Price Target; Analyst Consensus; Analyst Count; Years of Dividend Growth; Revenue; Net Income; Last Split Date; Split Ratio. Nothing else.

F:
Output ONLY four lines: (1) the column period labels; (2) the Revenue row (for banks/insurers use the top-line revenue row, e.g. Total Revenue or Revenue); (3) the EPS (Diluted) row; (4) the unit/currency note if shown. Values exactly as shown, comma-separated, in page order. Nothing else.

H:
Output every daily row of the price history table as compact CSV: date(yyyy-mm-dd),open,high,low,close,volume — numbers without thousands separators. No header, no commentary. Final line ROWS=<count>.

E:
Output ONLY these fields as name=value pairs separated by semicolons, values exactly as shown (n/a if absent): Fund name; Price; Close time; Assets; Expense Ratio; Dividend (amount and yield); Beta; Holdings; Inception Date; Asset Class; Category; ETF Provider; Index Tracked; Leverage; Total Return 1Y; Average Annual Return Since Inception; 52-Week Low; 52-Week High; Top 3 holdings with weights. Nothing else.

O:
Output ONLY these fields as name=value pairs separated by semicolons, values exactly as shown on the page (n/a if absent): Price; Market Cap; Revenue (ttm); Net Income (ttm); EPS (ttm); PE Ratio; Forward PE; Dividend (amount and yield); Beta; 52-Week Range; Analyst rating or consensus; Price Target. Nothing else.
