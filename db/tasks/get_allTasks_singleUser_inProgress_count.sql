SELECT count(*) FROM tasks
WHERE owner = $1 AND status = 'in progress';