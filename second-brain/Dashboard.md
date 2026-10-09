# Dashboard

Requires the Dataview plugin.

## Notes needing attention
```dataview
TABLE type, status, book
FROM "" WHERE status = "idea" OR status = "draft"
SORT file.mtime DESC LIMIT 25
```

## Canon characters
```dataview
TABLE role, born, died, nationality
FROM "04-People" WHERE status = "canon"
SORT born ASC
```

## Open plot threads
```dataview
TABLE book, introduced, resolves
FROM "05-Series/Plot-Threads" WHERE thread_status != "resolved"
```

## Unresolved contradictions
```dataview
LIST FROM "07-Continuity" WHERE type = "contradiction" AND resolved = false
```

## Inbox
```dataview
LIST FROM "00-Inbox" SORT file.ctime DESC
```
