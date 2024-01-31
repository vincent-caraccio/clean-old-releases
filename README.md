# Clean Old Releases

This action will delete all the releases and keep only the `N` latest ones.

## Inputs

## `token`

**Required** The github token to query the list of artifacts.

## `keep_count`

**Required** The amount of releases to keep

## Example usage

```
- name: Clean Old Releases
  uses: vincent-caraccio/clean-old-releases@v1.0.5
  with:
    token: ${{ secrets.GITHUB_TOKEN }} # No need to create it
    keep_count: 5
```
