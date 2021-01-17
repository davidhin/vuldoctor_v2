BEFORE DEPLOYING:

- Cache Vulnerability Database into ./db
- Should be around 1.7GB
- To do this, run:

```
docker build .
docker run --rm -v $PWD:/app -it <image_id> bash
export VDB_HOME=/app/db
export GITHUB_TOKEN=<personal github access token>
export VDB_HOME=/app/db
export NVD_START_YEAR=2010
export VDB_HOME=/app/db
vdb --cache
```

Also need to put service account json in the root directory, named
`solidmantra.json`. Download from Google Cloud Services.
