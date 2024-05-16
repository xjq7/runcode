import Docker from 'dockerode';
import dockerConfig from '../../config/docker';

const docker = new Docker({
  ...dockerConfig,
});

/**
 * 构建镜像
 *
 * @export
 */
export async function buildImage({ version }: { version: string }) {
  const stream = await docker.buildImage(
    {
      context: __dirname,
      src: [`./Dockerfile`],
    },
    { t: `cpp:${version}` }
  );
  await new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) => {
      console.log(err);
      return err ? reject(err) : resolve(res);
    });
  });
}
