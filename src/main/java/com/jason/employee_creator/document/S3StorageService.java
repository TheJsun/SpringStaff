package com.jason.employee_creator.document;

import java.time.Duration;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ContentDisposition;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Service
public class S3StorageService {

  private final S3Client s3Client;

  private static final Duration PRESIGN_DURATION = Duration.ofMinutes(5);

  private final S3Presigner presigner;
  private final String bucket;

  public S3StorageService(
    S3Presigner presigner,
    @Value("${app.s3.bucket}") String bucket,
    S3Client s3Client
  ) {
    this.presigner = presigner;
    this.bucket = bucket;
    this.s3Client = s3Client;
  }

  public String presignDownload(
    String key,
    String fileName,
    String contentType
  ) {
    GetObjectRequest get = GetObjectRequest.builder()
      .bucket(bucket)
      .key(key)
      .responseContentType(contentType)
      .responseContentDisposition(
        ContentDisposition.inline().filename(fileName).build().toString()
      )
      .build();

    return presigner
      .presignGetObject(request ->
        request.signatureDuration(PRESIGN_DURATION).getObjectRequest(get)
      )
      .url()
      .toString();
  }

  public String presignUpload(String key, String contentType, Long sizeBytes) {
    PutObjectRequest put = PutObjectRequest.builder()
      .bucket(bucket)
      .key(key)
      .contentType(contentType)
      .contentLength(null)
      .build();

    return presigner
      .presignPutObject(request ->
        request.signatureDuration(PRESIGN_DURATION).putObjectRequest(put)
      )
      .url()
      .toString();
  }

  public Optional<HeadObjectResponse> head(String key) {
    try {
      return Optional.of(s3Client.headObject(r -> r.bucket(bucket).key(key)));
    } catch (NoSuchKeyException e) {
      return Optional.empty();
    }
  }

  public void delete(String key) {
    s3Client.deleteObject(r -> r.bucket(bucket).key(key));
  }
}
