package com.jason.employee_creator.document;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ContentDisposition;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Service
public class S3StorageService {

  private static final Duration PRESIGN_DURATION = Duration.ofMinutes(5);

  private final S3Presigner presigner;
  private final String bucket;

  public S3StorageService(
    S3Presigner presigner,
    @Value("${app.s3.bucket}") String bucket
  ) {
    this.presigner = presigner;
    this.bucket = bucket;
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
}
