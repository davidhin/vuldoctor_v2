# Build and Deploy

```
docker build . --tag gcr.io/solid-mantra-301604/cvelinks; docker push gcr.io/solid-mantra-301604/cvelinks:latest
gcloud run deploy cvelinks --image gcr.io/solid-mantra-301604/cvelinks:latest --platform managed --region asia-northeast1 --allow-unauthenticated --concurrency 80 --max-instances=20
```

# Run container locally

```
docker run --env PORT=5001 --env MONGODB_TOKEN=$MONGODB_TOKEN -p 5001:5001 gcr.io/solid-mantra-301604/cvelinks:latest
```
