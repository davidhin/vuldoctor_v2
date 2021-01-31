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

Or build using existing image:

```
docker run --rm -v $PWD:/app --env GITHUB_TOKEN=$(echo $GITHUB_TOKEN) gcr.io/solid-mantra-301604/depscan:latest vdb --cache
docker build . --tag gcr.io/solid-mantra-301604/depscan; docker push gcr.io/solid-mantra-301604/depscan:latest
gcloud run deploy depscan --image gcr.io/solid-mantra-301604/depscan:latest --platform managed --region asia-northeast1 --allow-unauthenticated --concurrency 1 --max-instances=20
```

Also need to put service account json in the root directory, named
`solidmantra.json`. Download from Google Cloud Services.
