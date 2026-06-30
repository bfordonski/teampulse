const RANDOM_USER_API = 'https://randomuser.me/api/';

interface RandomUserResponse {
  results: Array<{
    picture: {
      large: string;
      medium: string;
      thumbnail: string;
    };
  }>;
}

export async function fetchProfilePhotoUrl(seed: string): Promise<string> {
  const url = `${RANDOM_USER_API}?seed=${encodeURIComponent(seed)}&nat=pl&inc=picture`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`randomuser.me failed (${res.status}) for seed ${seed}`);
  }

  const json = (await res.json()) as RandomUserResponse;
  const picture = json.results[0]?.picture?.large;

  if (!picture) {
    throw new Error(`No picture returned for seed ${seed}`);
  }

  return picture;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
